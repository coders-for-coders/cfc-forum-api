import { Express, RequestHandler } from 'express';
import logger from '../utils/logger';

export type RouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;

export function defineRoutes(controllers: any[], application: Express) {
    for (let i = 0; i < controllers.length; i++) {
        const controller = new controllers[i]();
        const routeHandlers: Map<keyof Express, Map<string, RequestHandler[]>> = Reflect.getMetadata('routeHandlers', controller);

        if (!routeHandlers) {
            logger.warn(`No route handlers found for controller: ${controllers[i].name}`);
            continue;
        }

        const controllerPath: string = Reflect.getMetadata('baseRoute', controller.constructor) || '';
        const methods = Array.from(routeHandlers.keys());

        for (let j = 0; j < methods.length; j++) {
            const method = methods[j];
            const routes = routeHandlers.get(method as keyof Express);

            if (!routes) {
                logger.warn(`No routes found for method: ${method as string}`);
                continue;
            }

            const routeNames = Array.from(routes.keys());
            for (let k = 0; k < routeNames.length; k++) {
                const routePath = routeNames[k];
                const handlers = routes.get(routePath);

                if (!handlers || handlers.length === 0) {
                    logger.warn(`No handlers found for route: ${method as string} ${controllerPath}${routePath}`);
                    continue;
                }

                try {
                    const fullPath = controllerPath + routePath;
                    // logger.info(`Registering route: ${method as string} ${fullPath}`);

                    application[method](fullPath, ...handlers);

                    logger.info(`Successfully registered route: ${method as string} ${fullPath}`);
                } catch (error) {
                    logger.error(`Failed to register route: ${method as string} ${controllerPath}${routePath}`, error);
                }
            }
        }
    }
}