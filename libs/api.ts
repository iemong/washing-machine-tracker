import * as dotenv from "dotenv";
import fetch from 'node-fetch'
import FormData from "form-data";

dotenv.config();

const createFormData = (data:{[key:string]: string}) => {
    const form = new FormData();
    Object
        .keys(data)
        .forEach(key => form.append(key, data[key]));
    return form;
}

export const postLineNotify = (message: string) => fetch('https://notify-api.line.me/api/notify', {
    method: 'post',
    headers: { 'Authorization': `Bearer ${process.env.TOKEN}` },
    body: createFormData({ message })
})
    .then(res => res.text())
    .then(body => console.log(body))
    .catch(err => console.error(err))
