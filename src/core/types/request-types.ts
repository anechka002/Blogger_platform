import {Request, Response} from 'express'

export type RequestWithBody<T> = Request<{},{},T>
export type RequestWithQuery<T> = Request<{},{},{},T>
export type RequestWithParams<T> = Request<T>
export type RequestWithParamsAndBody<T, B> = Request<T,{},B>
export type RequestWithParamsAndQuery<T, Q> = Request<T, {}, {}, Q>