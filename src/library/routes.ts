import { Express, RequestHandler } from 'express';
import logger, { BOLD, methodColors, RESET } from '../utils/logger';

export type RouteHandler = Map<keyof Express, Map<string, RequestHandler[]>>;

export function defineRoutes(controllers: any[], application: Express) {
    for (let i = 0; i < controllers.length; i++) {
        const controller = new controllers[i]();
        const routeHandlers: Map<keyof Express, Map<string, RequestHandler[]>> = Reflect.getMetadata('routeHandlers', controller);

        if (!routeHandlers) {
            logger.warn(`\x1b[31mNo route handlers found for controller: [${controllers[i].name}]\x1b[0m`);
            continue;
        }

        const controllerPath: string = Reflect.getMetadata('baseRoute', controller.constructor) || '';
        const methods = Array.from(routeHandlers.keys());

        for (let j = 0; j < methods.length; j++) {
            const method = methods[j];
            const routes = routeHandlers.get(method as keyof Express);

            if (!routes) {
                logger.warn(`\x1b[31mNo routes found for method: [${(method as string).toUpperCase()}]\x1b[0m`);
                continue;
            }

            const routeNames = Array.from(routes.keys());
            for (let k = 0; k < routeNames.length; k++) {
                const routePath = routeNames[k];
                const handlers = routes.get(routePath);

                if (!handlers || handlers.length === 0) {
                    logger.warn(`\x1b[31mNo handlers found for route: [${(method as string).toUpperCase()}] ${controllerPath}${routePath}\x1b[0m`);
                    continue;
                }

                try {
                    const fullPath = controllerPath + routePath;
                    application[method](fullPath, ...handlers);

                    const color = methodColors[method as keyof typeof methodColors] || methodColors.default;
                    logger.info(`Successfully registered route: ${color}${BOLD}[${(method as string).toUpperCase()}]${RESET} ${fullPath}`);
                } catch (error) {
                    const color = methodColors[method as keyof typeof methodColors] || methodColors.default;
                    logger.error(`\x1b[31mFailed to register route: ${color}${BOLD}[${(method as string).toUpperCase()}]${RESET} ${controllerPath}${routePath}\x1b[0m`, error);
                }
            }
        }
    }
}