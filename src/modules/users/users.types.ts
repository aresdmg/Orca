export type JWTPayloadType = {
    id: string,
    name: string,
    username: string
}

export interface IUserRepo {
    id: string,
    name: string,
    full_name: string,
    private: boolean,
    language: string,
    clone_url: string,
    html_url: string,
}