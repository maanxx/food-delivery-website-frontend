/**
 * List of popular countries for phone input
 * Each country follows the format of restcountries.com API v3.1
 */
export const POPULAR_COUNTRIES = [
    {
        name: { common: "Vietnam", official: "Socialist Republic of Vietnam" },
        cca2: "VN",
        cca3: "VNM",
        idd: { root: "+8", suffixes: ["4"] },
        flags: { png: "https://flagcdn.com/w320/vn.png" },
    },
    {
        name: { common: "United States", official: "United States of America" },
        cca2: "US",
        cca3: "USA",
        idd: { root: "+1", suffixes: [""] },
        flags: { png: "https://flagcdn.com/w320/us.png" },
    },
    {
        name: { common: "South Korea", official: "Republic of Korea" },
        cca2: "KR",
        cca3: "KOR",
        idd: { root: "+8", suffixes: ["2"] },
        flags: { png: "https://flagcdn.com/w320/kr.png" },
    },
    {
        name: { common: "Japan", official: "Japan" },
        cca2: "JP",
        cca3: "JPN",
        idd: { root: "+8", suffixes: ["1"] },
        flags: { png: "https://flagcdn.com/w320/jp.png" },
    },
    {
        name: { common: "Singapore", official: "Republic of Singapore" },
        cca2: "SG",
        cca3: "SGP",
        idd: { root: "+6", suffixes: ["5"] },
        flags: { png: "https://flagcdn.com/w320/sg.png" },
    },
    {
        name: { common: "Thailand", official: "Kingdom of Thailand" },
        cca2: "TH",
        cca3: "THA",
        idd: { root: "+6", suffixes: ["6"] },
        flags: { png: "https://flagcdn.com/w320/th.png" },
    },
    {
        name: { common: "China", official: "People's Republic of China" },
        cca2: "CN",
        cca3: "CHN",
        idd: { root: "+8", suffixes: ["6"] },
        flags: { png: "https://flagcdn.com/w320/cn.png" },
    },
];

export const getDialCode = (country) => {
    if (!country || !country.idd) return "";
    return country.idd.root + (country.idd.suffixes?.[0] || "");
};
