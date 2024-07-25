import express from "express";
import bodyParser from 'body-parser';
import cors from "cors"

export const expressConfig = (app) => {
    app.options("*", cors({ origin: '*', optionsSuccessStatus: 200 }));
    app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
    app.use(express.json({limit: '50mb'}))
    app.use(bodyParser.urlencoded({ extended: false ,limit: '50mb'}));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(express.json())
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
}