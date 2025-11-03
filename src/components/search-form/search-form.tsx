"use client";

import styles from "./search-form.module.css";

import LabelledRadioButton from "../labelled-radio-button/labelled-radio-button";
import NumericInput from "../numeric-input/numeric-input";
import { ChangeEvent, useMemo, useReducer } from "react";
import { SearchData, TravelType } from "@/types/search-data";
import getValidationMessages from "./get-validation-messages";
import { now } from "@/helpers/round-date";
import { formatToYYYYMMDD } from "@/helpers/date-format";
import InputWithSuggest from "../input-with-suggest/input-with-suggest";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import { DataListOption } from "../../types/data-list";

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

const citiesLoader = function (search: string) {
    return fetch(`/api/cities/?search=${search}`)
        .then((response) => response.json());
};


// Механизм работы c TanStack Query. Все запросы делаются
// объектом, который создается через конструктор QueryClient.
// Поэтому первым делом нужно создать такой объект.
const queryClient = new QueryClient();

// Этот объект используется для отправки запросов по всему приложению
// и хуки используют этот объект, поэтому должен существовать некий
// контекст, который дает доступ к этому объекту. Контекст создается
// внутри объекта QueryClient, а провайдер для него — 
// в теге <QueryClientProvider>. Если бы у нас было больше одного компонента,
// который делает запросы, мы бы сохранили этот QueryClient на самом верхнем
// уровне приложения, но поскольку у нас только один такой компонет, 
// мы создаем его версию, обернутую в контекст.
export default function SearchFormWithQueryClient(props: SearchFormProps) {
    return <QueryClientProvider client={queryClient}>
        <SearchForm {...props} />
    </QueryClientProvider>
}

function SearchForm({ defaultSearchData }: SearchFormProps) {
    const initialState = useMemo<SearchData>(() => defaultSearchData ?? {
        travelType: TravelType.ROUND_TRIP,
        passengers: 2,
        departure: "",
        arrival: "",
        dateDeparture: now(),
        dateArrival: now() + 24 * 60 * 60 * 1000,
    }, [defaultSearchData]);

    const [searchData, dispatch] = useReducer(searchDataReducer, initialState);

    const validationMessages = useMemo(() => {
        return getValidationMessages(searchData);
    }, [searchData]);

    // Теперь мы можем пользоваться хуками для запросов. Таких хуков много,
    // но нам пригодятся два — useQuery и useQueryClient.
    // Хук useQuery нужен для того, чтобы сделать запрос к данным пока
    // компонент загружается. Этот хук возвращает состояние загрузки
    // и полученные данные
    const { isPending: isPreloading, data: queriedDefaultCities = [] as readonly DataListOption[] } = useQuery<readonly DataListOption[]>({
        queryKey: ["cities", ""],
        // Для запроса пользуемся обычным fetch
        queryFn: () => citiesLoader("") as Promise<readonly DataListOption[]>,
    });

    // Хук useQueryClient позволяет отправлять кастомные запросы 
    // в любой момент времени...
    const queryClient = useQueryClient();

    // ...поэтому на основе объекта, который возвращается из этого хука
    // мы создадим загрузчик для наших инпутов и этот загрузчик
    // будет заниматься запросами на сервер...
    const loader = async function (search: string): Promise<readonly DataListOption[]> {
        return queryClient.fetchQuery<readonly DataListOption[]>({
            queryKey: ["cities", search],
            // ...с помощью той же самой функции, которой мы загружаем и исходные
            // данные.
            queryFn: () => citiesLoader(search) as Promise<readonly DataListOption[]>,
        });
    };

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
            {
                // Ну и остается только добавить пару прелоадеров на этапе
                // исходной загрузки списка популярных городов
                isPreloading
                    ? <input type="text" className={styles.searchInput} disabled placeholder="Loading cities..." />
                    : <InputWithSuggest
                        className={styles.searchInput}
                        defaultOptions={queriedDefaultCities}
                        placeholder={"Your City/Station"}
                        id="search-departure"
                        name="search-departure"
                        value={searchData.departure}
                        onChange={(evt: ChangeEvent<HTMLInputElement>) => dispatch({
                            type: "SET_DEPARTURE",
                            payload: evt.target.value,
                        })}
                        loader={loader}
                    />
            }
        </fieldset>

        <fieldset className={styles.searchField}>
            <label className={styles.searchFieldLabel}>Arrival</label>
            {
                isPreloading
                    ? <input type="text" className={styles.searchInput} disabled placeholder="Loading cities..." />
                    : <InputWithSuggest
                        className={styles.searchInput}
                        defaultOptions={queriedDefaultCities}
                        placeholder={"Where To?"}
                        id="search-arrival"
                        name="search-arrival"
                        value={searchData.arrival}
                        onChange={(evt: ChangeEvent<HTMLInputElement>) => dispatch({
                            type: "SET_ARRIVAL",
                            payload: evt.target.value,
                        })}
                        loader={loader}
                    />
            }
        </fieldset>

        <button type="button" className={styles.swapBtn}
            onClick={() => {
                dispatch({ type: "SET_DEPARTURE", payload: searchData.arrival });
                dispatch({ type: "SET_ARRIVAL", payload: searchData.departure });
            }}
        >
            🔄
        </button>

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
                name={searchData.travelType === TravelType.ONE_WAY ? undefined : "search-arrival-date"}
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
