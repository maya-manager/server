/**
 * This file contains all the global interfaces used in the application
 *
 * All the interface should have prefix `I` and should be in PascalCase
 */

/**
 * Interface for the successful response
 *
 * We can use generics to define the type of the data
 * generic is optional
 *
 * @example
 * ```typescript
 * IResponseSuccess<Users[]>
 * ```
 */
export interface IResponseSuccess<t = any> {
	status: "success";
	message: string;
	data?: t;
}

/**
 * Interface for the error response
 */
export interface IResponseError {
	status: "error";
	error: string;
}
