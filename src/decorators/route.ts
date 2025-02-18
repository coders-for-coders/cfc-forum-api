import { Express, RequestHandler } from 'express';
import 'reflect-metadata';
import { RouteHandler } from '../library/defineRoutes';


/**
 * @description Decorator to define a route for a controller
 * @param method - The HTTP method to use
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 */
export function Route(method: keyof Express, path: string = '', ...middleware: RequestHandler[]) {
    return (target: any, key: string, descriptor: PropertyDescriptor) => {
        const routePath = path;
        const routeHandlers: RouteHandler = Reflect.getMetadata('routeHandlers', target) || new Map();

        if (!routeHandlers.has(method)) {
            routeHandlers.set(method, new Map());
        }

        routeHandlers.get(method)?.set(routePath, [...middleware, descriptor.value]);

        Reflect.defineMetadata('routeHandlers', routeHandlers, target);
    };
}