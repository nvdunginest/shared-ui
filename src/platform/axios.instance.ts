import axios, { AxiosRequestConfig } from "axios";

interface AxiosBuilderConfig {
  baseUrl: string;
  /** URL endpoint để refresh token. Mặc định: `{baseUrl}/api/v1/soffice/token/refresh-token` */
  tokenRefreshUrl?: string;
}

let _baseUrl = "";
let _tokenRefreshUrl = "";

export function getBaseUrl(): string {
  return _baseUrl;
}

class AxiosBuilder {
  private static instance: AxiosBuilder;
  private _getAccessToken: () => string | null | Promise<string | null>;
  private _getRefreshToken: () => string | null | Promise<string | null>;
  private _isAccessTokenConfigured: boolean = false;

  private constructor() {
    this._getAccessToken = () => window.sessionStorage.getItem("access_token");
    this._getRefreshToken = () => window.localStorage.getItem("refresh_token");
  }

  public static getSingletonInstance(): AxiosBuilder {
    if (!AxiosBuilder.instance) {
      AxiosBuilder.instance = new AxiosBuilder();
    }
    return AxiosBuilder.instance;
  }

  /**
   * Cấu hình base URL cho tất cả API calls.
   * Phải được gọi TRƯỚC khi mount bất kỳ component nào từ shared-ui.
   *
   * @example
   * axiosBuilder.configure({
   *   baseUrl: `${import.meta.env.PUBLIC_APP_API_HOSTNAME}${import.meta.env.PUBLIC_APP_BASE_URI}`,
   * });
   */
  public configure(config: AxiosBuilderConfig): void {
    _baseUrl = config.baseUrl;
    _tokenRefreshUrl =
      config.tokenRefreshUrl ??
      `${config.baseUrl.split("/api/")[0]}/api/v1/soffice/token/refresh-token`;
  }

  public configureGetAccessToken(
    fn: () => string | null | Promise<string | null>
  ): void {
    this._getAccessToken = fn;
    this._isAccessTokenConfigured = true;
  }

  public configureGetRefreshToken(
    fn: () => string | null | Promise<string | null>
  ): void {
    this._getRefreshToken = fn;
  }

  public async getAccessToken(): Promise<string | null> {
    return await this._getAccessToken();
  }

  public async getRefreshToken(): Promise<string | null> {
    return await this._getRefreshToken();
  }

  public async getInstance(config?: AxiosRequestConfig) {
    const token = await this.getAccessToken();
    const defaultConfig: AxiosRequestConfig = {
      ...config,
      baseURL: _baseUrl,
      timeout: 600000,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const instance = axios.create(defaultConfig);

    if (!this._isAccessTokenConfigured) {
      const refreshToken = async () => {
        return axios.post(_tokenRefreshUrl, {
          refreshToken: await this.getRefreshToken(),
        });
      };

      instance.interceptors.response.use(
        (response) => response,
        async (error) => {
          const code = error.response?.status;
          if (code === 401) {
            return refreshToken()
              .then((rs) => {
                const { access_token, refresh_token } = rs.data;
                instance.defaults.headers.common["Authorization"] =
                  `Bearer ${access_token}`;
                sessionStorage.setItem("access_token", access_token);
                localStorage.setItem("refresh_token", refresh_token);
                const config = error.config;
                if (config.headers !== undefined) {
                  config.headers["Authorization"] = `Bearer ${access_token}`;
                  return instance(config);
                } else {
                  sessionStorage.removeItem("access_token");
                  localStorage.removeItem("refresh_token");
                  window.location.reload();
                  return null;
                }
              })
              .catch(() => {
                sessionStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                window.location.reload();
              });
          }
          return Promise.reject(error);
        }
      );
    }

    return instance;
  }
}

const axiosBuilder = AxiosBuilder.getSingletonInstance();
export default axiosBuilder;
