"use client";

import styles from "./input-with-suggest.module.css";

import React, { ChangeEvent, HTMLAttributes, useEffect, useState } from "react";

interface DataListOption {
  value: string,
}

interface OptionsState {
  state: "loading" | "idle",
  data: DataListOption[],
}

interface InputWithSuggestProps extends HTMLAttributes<HTMLInputElement> {
  defaultOptions: readonly DataListOption[],
  id: string,
  loader?: (search: string) => Promise<readonly DataListOption[]>

  // NB! Those values are added to interface
  // due to lack of time on researching
  // what interface to use as a parent
  // to be able to pass stadrand input
  // HTML attributes property. Needs
  // further investigation.
  placeholder?: string,
  name?: string,
  value?: string,
}

export default function InputWithSuggest(props: InputWithSuggestProps) {
  const {
    className = "",
    defaultOptions,
    onChange = () => { },
    loader = () => new Promise((res) => res(defaultOptions)),
    id,
    ...rest
  } = props;

  const [inputValue, setInputValue] = useState("");

  const [optionsState, setOptionsState] = useState<OptionsState>({
    state: "idle",
    data: [...defaultOptions],
  });

  useEffect(function () {
    if (inputValue.length < 2) {
      setOptionsState({
        state: "idle",
        data: [...defaultOptions],
      });
      return;
    }

    setOptionsState({
      ...optionsState,
      state: "loading",
    });

    loader(inputValue)
      .then((data) => {
        setOptionsState({
          state: "idle",
          data: [...data],
        });
      });
  }, [inputValue]);

  function handleInputChange(evt: ChangeEvent<HTMLInputElement>) {
    const value = evt.target.value;
    setInputValue(value);
    onChange(evt);
  }

  return <>
    <input
      className={`${className} ${styles.input} ${optionsState.state === "loading" ? styles.inputLoading : ``}`}
      autoCapitalize="off"
      autoComplete="off"
      autoCorrect="off"
      type="text"
      id={id}
      list={`${id}-list`}
      value={inputValue}
      onChange={handleInputChange}
      {...rest}
    />
    <datalist id={`${id}-list`}>
      {optionsState.data.map(({ value }) => <option value={value} key={value.replaceAll(" ", "-")} />)}
    </datalist>
  </>;
}
