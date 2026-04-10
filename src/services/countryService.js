import axios from "axios";

const baseURL = "https://restcountries.com/v3.1/all";

const getAll = async () =>
    axios({
        method: "get",
        baseURL: baseURL,
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log("Fetch error: " + error);
            throw error;
        });

const getCountryName = async () =>
    axios({
        method: "get",
        baseURL: baseURL,
        params: {
            fields: "name",
        },
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log("Fetch error: " + error);
            throw error;
        });

const getCountryId = async () =>
    axios({
        method: "get",
        baseURL: baseURL,
        params: {
            fields: "idd",
        },
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log("Fetch error: " + error);
            throw error;
        });

const getCountryFlag = async () =>
    axios({
        method: "get",
        baseURL: baseURL,
        params: {
            fields: "flags",
        },
    })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            console.log("Fetch error: " + error);
            throw error;
        });

const countryService = { getAll, getCountryName, getCountryId, getCountryFlag };

export default countryService;
