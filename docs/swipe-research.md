# 业界移动端上下滑动方案速览

## 原生 Pointer 事件
- **核心要点**：在容器上设置 `touch-action: none` 阻止浏览器滚动接管，并在 `pointerdown` 时调用 `setPointerCapture` 确保手指滑出容器时仍能收到 `pointermove` / `pointerup`。结合垂直阈值（如 50px）和方向判定即可实现 TikTok 式的卡片切换。
- **优点**：零第三方依赖，桌面与移动统一事件模型，易与自定义动效（`transform` / `requestAnimationFrame`）结合。

## 手势与动效库
- **`@use-gesture/react` + `react-spring`**：以 Hook 形式提供 `onDrag` / `onWheel` 手势，内置滑动距离、速度与回弹计算，配合物理动画可做出流畅的上下翻页。
- **Swiper（`swiper` 包）**：成熟的触控滑动库，支持垂直模式与卡片堆叠效果，包含分页指示与惯性滑动配置。
- **Hammer.js / ZingTouch**：传统手势识别库，提供 `swipe`、`pan`、`press` 等高层事件，适合非 React 场景或需要快速落地的 H5 页面。

## 交互细节实践
- **阻止页面滚动干扰**：`touch-action: none`、`overscroll-behavior: none` 与全屏容器布局，确保滑动只驱动内容切换。
- **滑动判定**：垂直距离阈值与方向优先级（竖直优先于水平）避免误触；可叠加滑动速度（velocity）判定提高快速轻扫的命中率。
- **动效表现**：切换时给离场卡片添加 `translateY` + `opacity` 动画，入场卡片淡入/上推，提供接近原生的流畅度。
- **性能与预取**：提前渲染/预取下一张卡片资源，列表较长时搭配虚拟化（如 `react-virtualized`）保证滚动顺滑。
