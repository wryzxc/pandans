/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<void>
  loadPackage: (packages: string[]) => Promise<void>
  setStdout: (options: { batched: (msg: string) => void }) => void
  setStderr: (options: { batched: (msg: string) => void }) => void
}

interface LoadPyodideType {
  (options: { indexURL: string }): Promise<PyodideInterface>
}

declare global {
  interface Window {
    pyodideInstance?: PyodideInterface
    loadPyodide?: LoadPyodideType
  }
}
