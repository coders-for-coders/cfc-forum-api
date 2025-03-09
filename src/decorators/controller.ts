/**
 * Controller decorator
 * @param basePath
 * @returns The controller decorator
 * @example
 * @Controller('/api')
 * class MyController {}
 * 
 * // This will set the base path of the controller to '/api'
*/
import { version } from "../config/server"

export function Controller(baseRoute: string = '') {
    return (target: any) => {
        Reflect.defineMetadata('baseRoute', "/"+ version + baseRoute, target);
    };
}