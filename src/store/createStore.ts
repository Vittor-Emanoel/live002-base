import { useSyncExternalStore } from 'react';

type SetterFn<T> = (prevState: T) => Partial<T>;
type SetStateFn<T> = (partialState: Partial<T> | SetterFn<T>) => void;

export function createStore<TState extends Record<string, any>>(
  createState: (setState: SetStateFn<TState>, getState: () => TState) => TState,
) {
  let state: TState;

  let listerners: Set<() => void>;

  function notifyListerners() {
    listerners.forEach((listerner) => listerner());
  }

  function setState(partialState: Partial<TState> | SetterFn<TState>) {
    const newValue =
      typeof partialState === 'function' ? partialState(state) : partialState;

    state = {
      ...state,
      ...newValue,
    };

    notifyListerners();
  }

  function subscribe(listerner: () => void) {
    listerners.add(listerner);

    return () => {
      listerners.delete(listerner);
    };
  }

  function getState() {
    return state;
  }

  function useStore<TValue>(
    selector: (currentState: TState) => TValue,
  ): TValue {
    return useSyncExternalStore(subscribe, () => selector(state));
  }

  state = createState(setState, getState);
  listerners = new Set();

  return useStore;
}
