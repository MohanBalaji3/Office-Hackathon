// Local server client - replaces Supabase
const API_URL = 'http://localhost:4000';

export interface LocalServerResponse {
  data?: any;
  error?: {
    message: string;
  };
}

class LocalServerClient {
  async functions_invoke(functionName: string, options: { body: any }): Promise<LocalServerResponse> {
    try {
      const response = await fetch(`${API_URL}/api/${functionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(options.body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: {
            message: errorData.error || `HTTP Error: ${response.status}`,
          },
        };
      }

      const data = await response.json();
      return { data };
    } catch (error) {
      return {
        error: {
          message: error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }
}

export const localServer = new LocalServerClient();

// Wrapper to maintain compatibility with Supabase client interface
export const supabase = {
  functions: {
    invoke: (functionName: string, options: { body: any }) =>
      localServer.functions_invoke(functionName, options),
  },
};
