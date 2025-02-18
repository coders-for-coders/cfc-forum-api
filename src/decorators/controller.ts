/**
 * @description Decorator to define a controller with a base route
 * @param baseRoute - The base route for the controller
 * @returns The controller class
 */
export function Controller(baseRoute: string = '') {
    return (target: any) => {
        Reflect.defineMetadata('baseRoute', '/api' + baseRoute, target);
    };
}