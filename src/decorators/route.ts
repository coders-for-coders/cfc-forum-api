import { Express, RequestHandler } from 'express';
import 'reflect-metadata';
import { RouteHandler } from '../utils/defineRoutes';


/**
 * @description Decorator to define a route for a controller
 * @param method - The HTTP method
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 * @example
 * @Route('get', '/users', authMiddleware)
 * getUsers(req: Request, res: Response) {
 *    res.json(users);
 * }
 * // This will define a GET route for '/users' with the authMiddleware
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

/**
 * @description Decorator to define a GET route for a controller
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 * @example
 * @Get('/users', authMiddleware)
 * getUsers(req: Request, res: Response) {
 *     res.json(users);
 * }
 */
export const Get = (path: string = '', ...middleware: RequestHandler[]) => Route('get', path, ...middleware);

/**
 * @description Decorator to define a POST route for a controller
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 * @example
 * @Post('/users', authMiddleware)
 * createUser(req: Request, res: Response) {
 *     res.json(user);
 * }
 */
export const Post = (path: string = '', ...middleware: RequestHandler[]) => Route('post', path, ...middleware);

/**
 * @description Decorator to define a PUT route for a controller
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 * @example
 * @Put('/users/:id', authMiddleware)
 * updateUser(req: Request, res: Response) {
 *     res.json(user);
 * }
 */

export const Put = (path: string = '', ...middleware: RequestHandler[]) => Route('put', path, ...middleware);

/**
 * @description Decorator to define a DELETE route for a controller
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 * @example
 * @Delete('/users/:id', authMiddleware)
 * deleteUser(req: Request, res: Response) {
 *     res.json(user);
 * }
 */
export const Delete = (path: string = '', ...middleware: RequestHandler[]) => Route('delete', path, ...middleware);

/**
 * @description Decorator to define a PATCH route for a controller
 * @param path - The path to the route
 * @param middleware - The middleware to use
 * @returns The route handler
 * @example
 * @Patch('/users/:id', authMiddleware)
 * updateUser(req: Request, res: Response) {
 *     res.json(user);
 * }
 */
export const Patch = (path: string = '', ...middleware: RequestHandler[]) => Route('patch', path, ...middleware);
