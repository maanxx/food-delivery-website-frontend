import axios from "axios";

const baseURL = "https://restcountries.com/v3.1";

const fallbackCountries = [
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
        name: { common: "United Kingdom", official: "United Kingdom of Great Britain and Northern Ireland" },
        cca2: "GB",
        cca3: "GBR",
        idd: { root: "+4", suffixes: ["4"] },
        flags: { png: "https://flagcdn.com/w320/gb.png" },
    },
];

const getAll = async () =>
    axios({
        method: "get",
        url: "/all",
        baseURL: baseURL,
        params: {
            fields: "name,cca2,cca3,idd,flags",
        },
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.error("Country API Error, using fallback:", error);
            return fallbackCountries;
        });

const getCountryName = async () =>
    getAll().then(data => data.map(c => c.name));

const getCountryId = async () =>
    getAll().then(data => data.map(c => c.cca3));

const getCountryFlag = async () =>
    getAll().then(data => data.map(c => c.flags));

const countryService = { getAll, getCountryName, getCountryId, getCountryFlag };

export default countryService;
