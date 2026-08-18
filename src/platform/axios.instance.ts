import axios, { AxiosInstance, AxiosRequestConfig } from "axios";

/** Factory provided by the host. Creates a fully-configured instance for a given baseUrl. */
export type InstanceFactory = (baseUrl: string) => AxiosInstance;

interface AxiosBuilderConfig {
  baseUrl: string;
}

let _baseUrl = "";

export function getBaseUrl(): string {
  return _baseUrl;
}

class AxiosBuilder {
  private static instance: AxiosBuilder;
  private _getAccessToken: () => string | null | Promise<string | null>;
  private _instanceFactory: InstanceFactory | null = null;
  private _axiosInstance: AxiosInstance | null = null;

  private constructor() {
    this._getAccessToken = () => window.sessionStorage.getItem("access_token");
  }

  public static getSingletonInstance(): AxiosBuilder {
    if (!AxiosBuilder.instance) {
      AxiosBuilder.instance = new AxiosBuilder();
    }
    return AxiosBuilder.instance;
  }

  /** Called by each mini-app on mount to set its own backend baseUrl. */
  public configure(config: AxiosBuilderConfig): void {
    _baseUrl = config.baseUrl;
    this._axiosInstance = null;
  }

  /**
   * Token getter used by AppLoader to decode JWT for userId.
   * Called once by the host at startup.
   */
  public configureGetAccessToken(
    fn: () => string | null | Promise<string | null>
  ): void {
    this._getAccessToken = fn;
  }

  /**
   * Factory provided by the host at startup, before any mini-app mounts.
   * Owns all auth logic: token injection, 401 handling, refresh.
   */
  public configureInstanceFactory(fn: InstanceFactory): void {
    this._instanceFactory = fn;
    this._axiosInstance = null;
  }

  public async getAccessToken(): Promise<string | null> {
    return await this._getAccessToken();
  }

  /**
   * Create an auth-wired instance for an arbitrary baseUrl.
   * Used by mini-apps that need to call a second external service
   * (e.g. an external API with a different baseUrl than the main one).
   */
  public createInstance(baseUrl: string): AxiosInstance {
    return this._instanceFactory
      ? this._instanceFactory(baseUrl)
      : this._createFallbackInstance(baseUrl);
  }

  public async getInstance(config?: AxiosRequestConfig): Promise<AxiosInstance> {
    if (!this._axiosInstance) {
      this._axiosInstance = this.createInstance(_baseUrl);
    }

    if (config) {
      return axios.create({ ...this._axiosInstance.defaults, ...config });
    }

    return this._axiosInstance;
  }

  /**
   * Minimal fallback when no factory is configured (standalone, no host).
   * Injects token but has no refresh — dispatches "auth-expired" on 401.
   */
  private _createFallbackInstance(baseUrl: string): AxiosInstance {
    const instance = axios.create({
      baseURL: baseUrl,
      timeout: 600000,
      headers: { "Content-Type": "application/json" },
    });

    instance.interceptors.request.use(async (config) => {
      const token = await this.getAccessToken();
      if (token && config.headers) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          window.dispatchEvent(new Event("auth-expired"));
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }
}

const axiosBuilder = AxiosBuilder.getSingletonInstance();
export default axiosBuilder;
