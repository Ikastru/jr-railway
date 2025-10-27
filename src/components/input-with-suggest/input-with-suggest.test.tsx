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

    const datalist = document.querySelector('datalist#tested-input-list');
    expect(datalist).toBeInTheDocument();

    const options = datalist?.querySelectorAll('option') ?? [];
    expect(options.length).toBe(defaultOptions.length);

    const values = Array.from(options).map((opt) => (opt as HTMLOptionElement).value);
    expect(values).toEqual(defaultOptions.map((o) => o.value));
  });

  it("When input value has 2 or more characters datalist is updated with fetched options", function() {
    const defaultOptions = Object.freeze([
      { value: "1", },
      { value: "2", },
      { value: "3", },
    ]);

    const fetchedOptions = Object.freeze([
      { value: "aa", },
      { value: "ab", },
      { value: "ac", },
    ]);

    const mockedLoader = jest.fn().mockImplementation(() => Promise.resolve(fetchedOptions));

    render(<InputWithSuggest
      defaultOptions={defaultOptions}
      loader={mockedLoader}
      id={`tested-input`}
    />);

    const input = document.querySelector('input#tested-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Simulate user typing 'aa'
    input.value = 'aa';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Wait for fetchOptions to be called and datalist to update
    setTimeout(() => {
      expect(mockedLoader).toHaveBeenCalledWith('aa');

      const datalist = document.querySelector('datalist#tested-input-list');
      expect(datalist).toBeInTheDocument();

      const options = datalist?.querySelectorAll('option') ?? [];
      expect(options.length).toBe(fetchedOptions.length);

      const values = Array.from(options).map((opt) => (opt as HTMLOptionElement).value);
      expect(values).toEqual(fetchedOptions.map((o) => o.value));
    }, 0);
  });

  it("When input value has less than 2 characters datalist reverts to default options", function() {
    const defaultOptions = Object.freeze([
      { value: "1", },
      { value: "2", },
      { value: "3", },
    ]);

    const fetchedOptions = Object.freeze([
      { value: "aa", },
      { value: "ab", },
      { value: "ac", },
    ]);

    const mockedLoader = jest.fn().mockImplementation(() => Promise.resolve(fetchedOptions));

    render(<InputWithSuggest
      defaultOptions={defaultOptions}
      loader={mockedLoader}
      id={`tested-input`}
    />);

    const input = document.querySelector('input#tested-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Simulate user typing 'a'
    input.value = 'a';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Wait for datalist to update
    setTimeout(() => {
      expect(mockedLoader).not.toHaveBeenCalled();

      const datalist = document.querySelector('datalist#tested-input-list');
      expect(datalist).toBeInTheDocument();

      const options = datalist?.querySelectorAll('option') ?? [];
      expect(options.length).toBe(defaultOptions.length);

      const values = Array.from(options).map((opt) => (opt as HTMLOptionElement).value);
      expect(values).toEqual(defaultOptions.map((o) => o.value));
    }, 0);
  });

  it("When input value length changes to less than 2 after being 2 or more, datalist reverts to default options", function() {
    const defaultOptions = Object.freeze([
      { value: "1", },
      { value: "2", },
      { value: "3", },
    ]);

    const fetchedOptions = Object.freeze([
      { value: "aa", },
      { value: "ab", },
      { value: "ac", },
    ]);

    const mockedLoader = jest.fn().mockImplementation(() => Promise.resolve(fetchedOptions));

    render(<InputWithSuggest
      defaultOptions={defaultOptions}
      loader={mockedLoader}
      id={`tested-input`}
    />);

    const input = document.querySelector('input#tested-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    // Simulate user typing 'aa'
    input.value = 'aa';
    input.dispatchEvent(new Event('input', { bubbles: true }));

    // Wait for fetchOptions to be called and datalist to update
    setTimeout(() => {
      expect(mockedLoader).toHaveBeenCalledWith('aa');

      // Now simulate user deleting input to 'a'
      input.value = 'a';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      // Wait for datalist to revert to default options
      setTimeout(() => {
        const datalist = document.querySelector('datalist#tested-input-list');
        expect(datalist).toBeInTheDocument();

        const options = datalist?.querySelectorAll('option') ?? [];
        expect(options.length).toBe(defaultOptions.length);

        const values = Array.from(options).map((opt) => (opt as HTMLOptionElement).value);
        expect(values).toEqual(defaultOptions.map((o) => o.value));
      }, 0);
    }, 0);
  });
});
