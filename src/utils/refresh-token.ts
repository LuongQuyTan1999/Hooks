import axios, { AxiosInstance } from 'axios'
import { getLocalStorage, removeLocalStorage, setLocalStorage } from 'utility/utils'

let instance: AxiosInstance
let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reson?: any) => void }[] = []

const processQueue = (error: any, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })

    failedQueue = []
}

export const getClient = (baseURL: string) => {
    const instance = axios.create({
        baseURL: baseURL,
        timeout: 40000
    })

    instance.interceptors.request.use(
        function (config: any) {
            // const token = parseCookies().jt || null
            const token = getLocalStorage('jt') || ''
            config.headers.Authorization = `Bearer ${token}`

            return { ...config }
        },
        function (error) {
            // Do something with request error
            return Promise.reject(error)
        }
    )

    instance.interceptors.response.use(
        function (response) {
            return response
        },
        async function (err) {
            const { status } = err.response
            if (status === 401) {
                let originalRequest = err.config
                if (isRefreshing) {
                    return new Promise(function (resolve, reject) {
                        failedQueue.push({ resolve, reject })
                    })
                        .then((token) => {
                            originalRequest.headers['Authorization'] = 'Bearer ' + token
                            return axios(originalRequest)
                        })
                        .catch((err) => {
                            return Promise.reject(err)
                        })
                }

                return new Promise(function (resolve, reject) {
                    const refreshToken = getLocalStorage('rf')
                    if (refreshToken) {
                        isRefreshing = true
                        const newService = axios.create({
                            baseURL: baseURL,
                            responseType: 'json'
                        })
                        return newService
                            .post('/auth/refresh-token', {
                                refresh_token: refreshToken,
                                userId: getLocalStorage('userId')
                            })
                            .then(({ data }) => {
                                const { refreshToken, token } = data
                                setLocalStorage('jt', token)
                                setLocalStorage('rf', refreshToken)
                                // @ts-ignore
                                instance.defaults.headers['Authorization'] = `Bearer ${token}`
                                originalRequest.headers['Authorization'] = 'Bearer ' + token
                                processQueue(null, token)
                                resolve(axios(originalRequest))
                            })
                            .catch((err) => {
                                processQueue(err, null)
                                removeLocalStorage('jt')
                                removeLocalStorage('rf')
                                removeLocalStorage('noti')
                                reject(err)
                            })
                            .then(() => {
                                isRefreshing = false
                            })
                    }
                })
            }
            return Promise.reject(err.response.data)
        }
    )

    return instance
}
