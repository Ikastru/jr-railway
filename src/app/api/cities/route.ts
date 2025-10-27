import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestURL = new URL(request.url);
  const search = requestURL.searchParams;
  const searchString = search.get("search")
    ? search.get("search") as string
    : null;

  return NextResponse.json(
    [
      { value: "Москва", default: true, },
      { value: "Мурино" },
      { value: "Санкт Петербург", default: true, },
      { value: "Нижнекамск" },
      { value: "Нижневартовск" },
      { value: "Нижний Тагил" },
      { value: "Нижний Новгород", default: true, },
      { value: "Владивосток", default: true, },
      { value: "Вышний Волочек" },
      { value: "Пекин" },
      { value: "Берлин", default: true, },
      { value: "Биробиджан" },
      { value: "Лондон", default: true, },
    ].filter((o) => searchString === null
      ? o.default
      : o.value.startsWith(searchString)
    ).map(({ value }) => ({ value }))
  );
}
