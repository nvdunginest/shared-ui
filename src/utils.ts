import { BaseOptionType, DefaultOptionType } from "antd/es/cascader";

export const isEmptyOrSpaces = (str: string): boolean =>
  str === undefined || str === null || str.match(/^ *$/) !== null;

export const floatFromString = (str: string): number =>
  parseFloat(str.replace(/,/g, ""));

export const intFromString = (str: string): number => parseInt(str, 10);

export function formatDate(date: Date, formatString = "dd/MM/yyyy"): string {
  let result = formatString;
  const format = [
    { symbol: "dd", value: date.getDate() < 10 ? `0${date.getDate()}` : date.getDate() },
    {
      symbol: "MM",
      value: date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : `${date.getMonth() + 1}`,
    },
    { symbol: "yyyy", value: date.getFullYear() },
    { symbol: "hh", value: date.getHours() < 10 ? `0${date.getHours()}` : date.getHours() },
    {
      symbol: "mm",
      value: date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes(),
    },
    {
      symbol: "ss",
      value: date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds(),
    },
    { symbol: "yy", value: `${date.getFullYear()}`.substring(2) },
  ];
  format.forEach((f) => {
    result = result.replace(f.symbol, f.value as string);
  });
  return result;
}

export function formatNumber(value: number, frac = 0, locate = "en-US", currency?: string): string {
  const options: Intl.NumberFormatOptions = {
    currency,
    maximumFractionDigits: frac,
    minimumFractionDigits: frac,
  };
  return new Intl.NumberFormat(locate, options).format(value);
}

export const valueFloatFormat = (value: string | number | null) => {
  if (typeof value === "string") {
    const number = floatFromString(value);
    if (isNaN(number)) return value;
    return formatNumber(number, 2);
  }
  if (typeof value === "number") return formatNumber(value, 2);
  return value;
};

export function getDiffDays(date1: Date, date2: Date): number {
  const a = new Date(date1);
  const b = new Date(date2);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24) + 1;
}

export const getShortName = (displayName: string): string => {
  const trimmed = displayName.trim();
  const first = trimmed.substring(0, 1);
  const parts = trimmed.split(" ");
  const last = parts[parts.length - 1].substring(0, 1);
  return `${first}${last}`;
};

export function toProperCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) =>
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

export function removeVietnameseTones(str: string): string {
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  str = str.replace(/đ/g, "d");
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  str = str.replace(/Đ/g, "D");
  str = str.replace(/̀|́|̃|̉|̣/g, "");
  str = str.replace(/ˆ|̆|̛/g, "");
  str = str.replace(/ + /g, " ").trim();
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  return str;
}

export function formatFileSize(fileSize: number, decimalPoint?: number): string {
  if (fileSize === 0) return "0 Bytes";
  const k = 1000;
  const dm = decimalPoint ?? 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(fileSize) / Math.log(k));
  return parseFloat((fileSize / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const cascaderFilter = (inputValue: string, path: DefaultOptionType[]) => {
  const norm = removeVietnameseTones(inputValue).toLowerCase();
  return path.some(
    (option) =>
      removeVietnameseTones(option.label as string).toLowerCase().indexOf(norm) > -1
  );
};

export const selectSearch = (inputValue: string, option?: BaseOptionType): boolean => {
  if (!option || !inputValue) return false;
  const normInput = removeVietnameseTones(inputValue).toLocaleLowerCase();
  const normLabel = removeVietnameseTones(option.label as string).toLowerCase();
  return normLabel.indexOf(normInput) !== -1;
};

export function toCamelCase(_: string, value: { [x: string]: unknown }) {
  if (value && typeof value === "object") {
    for (const k in value) {
      if (/^[A-Z]/.test(k) && Object.hasOwnProperty.call(value, k)) {
        value[k.charAt(0).toLowerCase() + k.substring(1)] = value[k];
        delete value[k];
      }
    }
  }
  return value;
}

export const getMaxDate = (dates: Date[]): Date =>
  dates.reduce((a, b) => (a > b ? a : b));

const defaultNumbers = " hai ba bốn năm sáu bảy tám chín";
const chuHangDonVi = ("1 một" + defaultNumbers).split(" ");
const chuHangChuc = ("lẻ mười" + defaultNumbers).split(" ");
const chuHangTram = ("không một" + defaultNumbers).split(" ");

function convertBlockTwo(number: string): string {
  let dv = chuHangDonVi[parseInt(number[1])];
  const chuc = chuHangChuc[parseInt(number[0])];
  let append = "";
  if (parseInt(number[1]) > 0 && parseInt(number[0]) === 5) dv = "lăm";
  if (parseInt(number[0]) > 1) {
    append = " mươi";
    if (parseInt(number[1]) === 1) dv = " mốt";
  }
  return chuc + "" + append + " " + dv;
}

function convertBlockThree(number: string): string | undefined {
  if (number === "000") return "";
  switch (number.length) {
    case 0: return "";
    case 1: return chuHangDonVi[parseInt(number[0])];
    case 2: return convertBlockTwo(number);
    case 3: {
      const chucDv = number.slice(1, 3) !== "00" ? convertBlockTwo(number.slice(1, 3)) : "";
      const tram = chuHangTram[parseInt(number[0])] + " trăm";
      return tram + " " + chucDv;
    }
  }
}

const dvBlock = "1 nghìn triệu tỷ".split(" ");

export function readAmount(number: number): string {
  const str = parseInt(`${number}`) + "";
  if (!str || str === "NaN") return "";

  let index = str.length;
  const arr: string[] = [];
  while (index >= 0) {
    arr.push(str.substring(index, Math.max(index - 3, 0)));
    index -= 3;
  }

  const result: string[] = [];
  for (let i = arr.length - 1; i >= 0; i--) {
    if (arr[i] !== "" && arr[i] !== "000") {
      result.push(convertBlockThree(arr[i]) ?? "");
      if (dvBlock[i]) result.push(dvBlock[i]);
    }
  }

  return result.join(" ").replace(/[0-9]/g, "").replace(/ $/, "");
}
