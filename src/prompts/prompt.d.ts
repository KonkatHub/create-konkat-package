declare class CancelablePromise<T> extends Promise<T> {
  cancel: () => void;
}

type Context = {
  input?: NodeJS.ReadableStream;
  output?: NodeJS.WritableStream;
  clearPromptOnDone?: boolean;
};

export type Prompt<Value, Config> = (
  config: Config,
  context?: Context
) => CancelablePromise<Value>;
