// Light entry: pure text/number/date helpers shared by the document apps (identical copy in every app).
import type { BaseOptionType, DefaultOptionType } from "antd/es/cascader";

export const isEmptyOrSpaces = function (str: string): boolean {
  return str === undefined || str === null || str.match(/^ *$/) !== null;
};

export const floatFromString = function (str: string): number {
  return parseFloat(str.replace(/,/g, ""));
};

export const intFromString = function (str: string): number {
  return parseInt(str, 10);
};

/**
 * Format date
 * @param date
 * @param formatString
 * dd - Day
 * MM - Month
 * yy - Year
 * yyyy - Full year
 * hh - Hour
 * mm - minute
 * ss - second
 * @returns
 */
export function formatDate(date: Date, formatString = "dd/MM/yyyy"): string {
  let result = formatString;

  const format = [
    {
      symbol: "dd",
      value: date.getDate() < 10 ? `0${date.getDate()}` : date.getDate(),
    },
    {
      symbol: "MM",
      value:
        date.getMonth() + 1 < 10
          ? `0${date.getMonth() + 1}`
          : `${date.getMonth() + 1}`,
    },
    {
      symbol: "yyyy",
      value: date.getFullYear(),
    },
    {
      symbol: "hh",
      value: date.getHours() < 10 ? `0${date.getHours()}` : date.getHours(),
    },
    {
      symbol: "mm",
      value:
        date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes(),
    },
    {
      symbol: "ss",
      value:
        date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds(),
    },
    {
      symbol: "yy",
      value: `${date.getFullYear()}`.substring(2),
    },
  ];

  format.map((f) => {
    result = result.replace(f.symbol, f.value as string);
    return f.symbol;
  });

  return result;
}

export function formatNumber(
  value: number,
  frac = 0,
  locate = "en-US",
  currency?: string
): string {
  const options: Intl.NumberFormatOptions = {
    currency: currency,
    maximumFractionDigits: frac,
    minimumFractionDigits: frac,
  };
  const numberFormat = new Intl.NumberFormat(locate, options);
  return numberFormat.format(value);
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
  const date1Cnv = new Date(date1);
  const date2Cnv = new Date(date2);

  date1Cnv.setHours(0, 0, 0, 0);
  date2Cnv.setHours(0, 0, 0, 0);

  const diffTimes = date2Cnv.getTime() - date1Cnv.getTime();
  const diffDays = diffTimes / (1000 * 60 * 60 * 24);

  return diffDays + 1;
}

export const getShortName = (displayName: string): string => {
  const first = displayName.trim().substring(0, 1);
  const last = displayName
    .trim()
    .split(" ")
    [displayName.trim().split(" ").length - 1].substring(0, 1);
  return `${first}${last}`;
};

export function toProperCase(str: string): string {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
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
  // Some system encode vietnamese combining accent as individual utf-8 characters
  // Một vài bộ encode coi các dấu mũ, dấu chữ như một kí tự riêng biệt nên thêm hai dòng này
  str = str.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // ̀ ́ ̃ ̉ ̣  huyền, sắc, ngã, hỏi, nặng
  str = str.replace(/\u02C6|\u0306|\u031B/g, ""); // ˆ ̆ ̛  Â, Ê, Ă, Ơ, Ư
  // Remove extra spaces
  // Bỏ các khoảng trắng liền nhau
  str = str.replace(/ + /g, " ");
  str = str.trim();
  // Remove punctuations
  // Bỏ dấu câu, kí tự đặc biệt
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " "
  );
  return str;
}

export function formatFileSize(fileSize: number, decimalPoint?: number) {
  if (fileSize === 0) return "0 Bytes";
  const k = 1000;
  const dm = decimalPoint || 2;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(fileSize) / Math.log(k));
  return parseFloat((fileSize / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export const cascaderFilter = (
  inputValue: string,
  path: DefaultOptionType[]
) => {
  const normalizeInputValue = removeVietnameseTones(inputValue).toLowerCase();
  return path.some(
    (option) =>
      removeVietnameseTones(option.label as string)
        .toLowerCase()
        .indexOf(normalizeInputValue) > -1
  );
};

export const selectSearch = (
  inputValue: string,
  option?: BaseOptionType
): boolean => {
  if (!option || !inputValue) {
    return false;
  }
  const normalizeInputValue =
    removeVietnameseTones(inputValue).toLocaleLowerCase(); // Remove diacritics

  const normalizeOptionLabel = removeVietnameseTones(
    option.label as string
  ).toLowerCase();

  return normalizeOptionLabel.indexOf(normalizeInputValue) !== -1;
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

export const getMaxDate = (dates: Date[]): Date => {
  const mxDate = dates.reduce(function (a, b) {
    return a > b ? a : b;
  });

  return mxDate;
};

const defaultNumbers = " hai ba bốn năm sáu bảy tám chín";

const chuHangDonVi = ("1 một" + defaultNumbers).split(" ");
const chuHangChuc = ("lẻ mười" + defaultNumbers).split(" ");
const chuHangTram = ("không một" + defaultNumbers).split(" ");

function convert_block_three(number: string) {
  if (number === "000") return "";
  const _a = number + ""; //Convert biến 'number' thành kiểu string
  let chuc_dv = "";
  let tram = "";

  //Kiểm tra độ dài của khối
  switch (_a.length) {
    case 0:
      return "";
    case 1:
      return chuHangDonVi[parseInt(_a[0])];
    case 2:
      return convert_block_two(_a);
    case 3:
      if (_a.slice(1, 3) !== "00") {
        chuc_dv = convert_block_two(_a.slice(1, 3));
      }
      tram = chuHangTram[parseInt(_a[0])] + " trăm";
      return tram + " " + chuc_dv;
  }
}

function convert_block_two(number: string) {
  let dv = chuHangDonVi[parseInt(number[1])];
  const chuc = chuHangChuc[parseInt(number[0])];
  let append = "";

  // Nếu chữ số hàng đơn vị là 5
  if (parseInt(number[1]) > 0 && parseInt(number[0]) === 5) {
    dv = "lăm";
  }

  // Nếu số hàng chục lớn hơn 1
  if (parseInt(number[0]) > 1) {
    append = " mươi";

    if (parseInt(number[1]) === 1) {
      dv = " mốt";
    }
  }

  return chuc + "" + append + " " + dv;
}

const dvBlock = "1 nghìn triệu tỷ".split(" ");

export function readAmount(number: number) {
  const str = parseInt(`${number}`) + "";
  let i = 0;
  const arr = [];
  let index = str.length;
  const result = [];
  let rsString = "";

  if (index == 0 || str == "NaN") {
    return "";
  }

  // Chia chuỗi số thành một mảng từng khối có 3 chữ số
  while (index >= 0) {
    arr.push(str.substring(index, Math.max(index - 3, 0)));
    index -= 3;
  }

  // Lặp từng khối trong mảng trên và convert từng khối đấy ra chữ Việt Nam
  for (i = arr.length - 1; i >= 0; i--) {
    if (arr[i] != "" && arr[i] != "000") {
      result.push(convert_block_three(arr[i]));

      // Thêm đuôi của mỗi khối
      if (dvBlock[i]) {
        result.push(dvBlock[i]);
      }
    }
  }

  // Join mảng kết quả lại thành chuỗi string
  rsString = result.join(" ");

  // Trả về kết quả kèm xóa những ký tự thừa
  return rsString.replace(/[0-9]/g, "").replace(/ /g, " ").replace(/ $/, "");
}

/**
 * Copies text to the clipboard. Uses the async Clipboard API where the page is allowed to
 * (secure context), otherwise a hidden textarea + execCommand. Resolves to false when both fail.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to the legacy path (permission denied, insecure context...)
  }
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.cssText = "position:fixed;top:0;left:0;opacity:0;";
  document.body.appendChild(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(area);
  }
}
