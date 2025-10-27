"use client";

import styles from "./search-form.module.css";

import LabelledRadioButton from "../labelled-radio-button/labelled-radio-button";
import NumericInput from "../numeric-input/numeric-input";
import { ChangeEvent, useMemo, useReducer } from "react";
import { SearchData, TravelType } from "@/types/search-data";
import getValidationMessages from "./get-validation-messages";
import { now } from "@/helpers/round-date";
import { formatToYYYYMMDD } from "@/helpers/date-format";
import InputWithSuggest from "./input-with-suggest/input-with-suggest";

type SearchDataReducerAction =
  | { type: "SET_TRAVEL_TYPE", payload: TravelType }
  | { type: "SET_PASSENGERS", payload: number }
  | { type: "SET_DEPARTURE", payload: string }
  | { type: "SET_ARRIVAL", payload: string }
  | { type: "SET_DATE_DEPARTURE", payload: number }
  | { type: "SET_DATE_ARRIVAL", payload: number };

function searchDataReducer(state: SearchData, { type, payload }: SearchDataReducerAction): SearchData {
  switch (type) {
    case "SET_TRAVEL_TYPE":
      return { ...state, travelType: payload };
    case "SET_PASSENGERS":
      return { ...state, passengers: payload };
    case "SET_DEPARTURE":
      return { ...state, departure: payload };
    case "SET_ARRIVAL":
      return { ...state, arrival: payload };
    case "SET_DATE_DEPARTURE":
      return { ...state, dateDeparture: payload };
    case "SET_DATE_ARRIVAL":
      return { ...state, dateArrival: payload };
    default:
      throw new TypeError("Unknown action");
  }
};

interface SearchFormProps {
  defaultSearchData?: SearchData | null,
}

const DEFAULT_CITIES = Object.freeze([
  { value: "Москва" },
  { value: "Санкт Петербург" },
  { value: "Нижний Новгород" },
  { value: "Владивосток" },
  { value: "Пекин" },
  { value: "Берлин" },
  { value: "Лондон" },
]);

const citiesLoader = async function (search: string) {
  const citiesResponse = await fetch(`/api/cities/?search=${search}`);
  const citiesData = await citiesResponse.json();
  return citiesData;
};

export default function SearchForm({ defaultSearchData }: SearchFormProps) {
  // TODO:
  // 1. Изменить интерфейс SearchForm чтобы у нее появился прелоадер (для default cities)
  // 2. Загрузить DefaultCities через citiesLoader
  // 3. Описать это через tanstack

  const [searchData, dispatch] = useReducer(searchDataReducer, defaultSearchData ?? {
    travelType: TravelType.ROUND_TRIP,
    passengers: 2,
    departure: "",
    arrival: "",
    dateDeparture: (() => now())(),
    dateArrival: (() => now() + 24 * 60 * 60 * 1000)(),
  });

  const validationMessages = useMemo(() => {
    return getValidationMessages(searchData);
  }, [searchData]);

  return <form className={styles.search} method="GET" action="/search">
    <fieldset className={`${styles.searchField} ${styles.searchFieldInline}`}>
      <LabelledRadioButton
        style={{ whiteSpace: "nowrap" }}
        id="search-type-round-trip"
        name="search-type"
        value="round-trip"
        defaultChecked={searchData.travelType === TravelType.ROUND_TRIP}
        onClick={() => dispatch({
          type: "SET_TRAVEL_TYPE",
          payload: TravelType.ROUND_TRIP,
        })}
      >Round Trip</LabelledRadioButton>

      <LabelledRadioButton
        style={{ whiteSpace: "nowrap" }}
        id="search-type-one-way"
        name="search-type"
        value="one-way"
        defaultChecked={searchData.travelType === TravelType.ONE_WAY}
        onClick={() => dispatch({
          type: "SET_TRAVEL_TYPE",
          payload: TravelType.ONE_WAY,
        })}
      >One Way</LabelledRadioButton>

      <NumericInput
        className={styles.passengersInput}
        id="search-passengers"
        name="search-passengers"
        step={1} min={1} max={10}
        value={searchData.passengers}
        onChange={(value) => dispatch({
          type: "SET_PASSENGERS",
          payload: value,
        })}
      />
    </fieldset>

    <fieldset className={styles.searchField}>
      <label className={styles.searchFieldLabel}>Departure</label>
      <InputWithSuggest
        className={styles.searchInput}
        defaultOptions={DEFAULT_CITIES}
        placeholder="Your City/Station"
        id="search-departure"
        name="search-departure"
        value={searchData.departure}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => dispatch({
          type: "SET_DEPARTURE",
          payload: evt.target.value,
        })}
        loader={citiesLoader}
      />
    </fieldset>

    <fieldset className={styles.searchField}>
      <label className={styles.searchFieldLabel}>Arrival</label>
      <InputWithSuggest
        className={styles.searchInput}
        defaultOptions={DEFAULT_CITIES}
        placeholder="Where To?"
        id="search-arrival"
        name="search-arrival"
        value={searchData.arrival}
        onChange={(evt: ChangeEvent<HTMLInputElement>) => dispatch({
          type: "SET_ARRIVAL",
          payload: evt.target.value,
        })}
        loader={citiesLoader}
      />
    </fieldset>

    <fieldset className={styles.searchField}>
      <label className={styles.searchFieldLabel}>Pick Your Lucky Day</label>

      <input
        className={styles.searchInput}
        placeholder="Depart"
        type="date"
        id="search-departure-date"
        name="search-departure-date"
        value={formatToYYYYMMDD(new Date(searchData.dateDeparture))}
        onChange={(evt) => dispatch({
          type: "SET_DATE_DEPARTURE",
          payload: new Date(evt.target.value).getTime(),
        })}
      />

      <input
        className={styles.searchInput}
        placeholder="Return"
        type="date"
        id="search-arrival-date"
        name="search-arrival-date"
        disabled={searchData.travelType === TravelType.ONE_WAY}
        value={formatToYYYYMMDD(new Date(searchData.dateArrival))}
        onChange={(evt) => dispatch({
          type: "SET_DATE_ARRIVAL",
          payload: new Date(evt.target.value).getTime(),
        })}
      />
    </fieldset>

    <button disabled={validationMessages.length > 0} type="submit" className={styles.searchSubmit}>Ticket, Please!</button>

    {
      validationMessages.length === 0
        ? null
        : <ul className={styles.validationMessages}>
          {validationMessages.map((m, i) => <li className={styles.validationMessage} key={`message-${i}`}>{m}</li>)}
        </ul>
    }
  </form>;
};
