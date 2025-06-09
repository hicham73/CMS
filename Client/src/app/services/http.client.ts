import { IConfig } from "../config";

export class HttpClient {
    constructor(private config: IConfig, private token: string = '') {
      this.token = token;
    }

    get baseUrl(): string {
        return `https://${this.config.CRM_RES}/api/data/v9.2/`;
    }
  
    /**
     * Makes a GET request.
     * @param url - The endpoint URL (relative or absolute).
     * @param headers - Optional HTTP headers.
     * @returns A Promise resolving to the response data.
     */
    async get<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
      const response = await fetch(this.resolveUrl(url), {
        method: 'GET',
        headers: this.prepareHeaders(headers),
      });
      return this.handleResponse<T>(response);
    }
  
    /**
     * Makes a POST request.
     * @param url - The endpoint URL (relative or absolute).
     * @param body - The request body.
     * @param headers - Optional HTTP headers.
     * @returns A Promise resolving to the response data.
     */
    async post<T>(url: string, body: any, headers: Record<string, string> = {}): Promise<T> {
      const response = await fetch(this.resolveUrl(url), {
        method: 'POST',
        headers: this.prepareHeaders(headers),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    }
  
    /**
     * Makes a PUT request.
     * @param url - The endpoint URL (relative or absolute).
     * @param body - The request body.
     * @param headers - Optional HTTP headers.
     * @returns A Promise resolving to the response data.
     */
    async put<T>(url: string, body: any, headers: Record<string, string> = {}): Promise<T> {
      const response = await fetch(this.resolveUrl(url), {
        method: 'PUT',
        headers: this.prepareHeaders(headers),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    }
  
    /**
     * Makes a PATCH request.
     * @param url - The endpoint URL (relative or absolute).
     * @param body - The request body.
     * @param headers - Optional HTTP headers.
     * @returns A Promise resolving to the response data.
     */
    async patch<T>(url: string, body: any, headers: Record<string, string> = {}): Promise<T> {
      const response = await fetch(this.resolveUrl(url), {
        method: 'PATCH',
        headers: this.prepareHeaders(headers),
        body: JSON.stringify(body),
      });
      return this.handleResponse<T>(response);
    }
  
    /**
     * Makes a DELETE request.
     * @param url - The endpoint URL (relative or absolute).
     * @param headers - Optional HTTP headers.
     * @returns A Promise resolving to the response data.
     */
    async delete<T>(url: string, headers: Record<string, string> = {}): Promise<T> {
      const response = await fetch(this.resolveUrl(url), {
        method: 'DELETE',
        headers: this.prepareHeadersForDelete(headers),
      });
      return this.handleResponse<T>(response);
    }
  
    /**
     * Prepares HTTP headers with defaults.
     * @param headers - Optional additional headers.
     * @returns A Record of HTTP headers.
     */
    private prepareHeaders(headers: Record<string, string>): Record<string, string> {
      return {
        'Content-Type': 'application/json',
        ...headers,
      };
    }

    private prepareHeadersForDelete(headers: Record<string, string>): Record<string, string> {
      return {
        'Content-Type': 'application/json',
        'If-Match': '*', // added for delete
        ...headers,
      };
    }
  
    /**
     * Resolves the full URL based on the base URL and endpoint.
     * @param url - The endpoint URL (relative or absolute).
     * @returns The full URL as a string.
     */
    private resolveUrl(url: string): string {
      return this.baseUrl && !url.startsWith('http') ? `${this.baseUrl}${url}` : url;
    }
  
    /**
     * Handles the HTTP response.
     * @param response - The Fetch API response object.
     * @returns A Promise resolving to the parsed response data.
     * @throws An error if the response is not successful.
     */
    private async handleResponse<T>(response: Response): Promise<any> {
    
      let result = '';
      if(response.body != null) {
        const reader = response.body.getReader(); // Get the ReadableStream reader
        const decoder = new TextDecoder();       // Decode binary chunks into text
        let done = false;
      
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone; // Check if the stream is finished
          if (value) {
            result += decoder.decode(value, { stream: true }); // Append chunk
          }
        }
      }

      let res: any = {};
      try {
        res = JSON.parse(result); // Parse the JSON string
      } catch(e) {
        res = result;
      }

      if (!response.ok) {
        let errMessage = '';
        if(res && res.error && res.error.message) {
          errMessage = res.error.message;
          let idx = errMessage.indexOf('at Microsoft');
          errMessage = errMessage.replace('----> InnerException : Microsoft.OData.ODataException:', 'Inner Exception:');
          if(idx > 0) {
            errMessage = errMessage.substring(0, idx);
          }
        } else {
          errMessage = result;
        }
        throw new Error(`HTTP error! status: ${response.status}, message: ${errMessage}`);
      }
      
      return res; // Return the full response as a string

    }


  }