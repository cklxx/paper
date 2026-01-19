import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

export function renderWithRouter(
  ui: ReactElement,
  { route = "/", path }: { route?: string; path?: string } = {},
) {
  const resolvedPath = path ?? route;
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={resolvedPath} element={ui} />
      </Routes>
    </MemoryRouter>,
  );
}
