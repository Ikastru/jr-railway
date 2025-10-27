/*
  - [x] При открытии Departure или Arrival показывается список популярных направлений в `datalist` у `input`
  - [x] При вводе значений, после второй буквы `datalist` обновляется на результаты запроса по этим двум буквам
  - [x] Если букв стало меньше двух, то мы возвращаем исходный `datalist` с популярными запросами
  - [x] Поиск ведется по особенностям поведения `datalist`
 */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';

import React from 'react';
import InputWithSuggest from './input-with-suggest';

describe("UI Test for input component", function() {
  it("When <input /> is focused datalist contains popular directions", function() {
    const defaultOptions = Object.freeze([
      { value: "1", },
      { value: "2", },
      { value: "3", },
    ]);

    render(<InputWithSuggest
      defaultOptions={defaultOptions}
      id={`tested-input`}
    />);

    // TODO
    // 1. Find datalist
    // 2. Expect datalist to Equal defaultOptions
    //   - three elements
    //   - each of them is equal to corresponding element
  });
});
