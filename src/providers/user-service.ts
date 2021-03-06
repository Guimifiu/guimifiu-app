import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { ENV } from '../config/environment-development';
import { API } from '../config/guimifiu-api';
import { User } from '../models/user';

@Injectable()
export class UserService {

  endpoint = ENV.API_URL + 'users/';

  constructor(public http: Http) {
    console.log('Hello UserService Provider');
  }

  create(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = this.endpoint + 'create'
      let body = { 'user': user }
      console.log('url:' + url);
      console.log('body:' + JSON.stringify(body));
      this.http
        .post(url, body, API.options)
        .map(res => res.json())
        .subscribe(
          data => resolve(data),
          error => reject(error),
          () => console.log("User created")
        );
    });
  }

  update(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = this.endpoint + user.id
      let body = { 'user': user }
      console.log('url:' + url);
      console.log('body:' + JSON.stringify(body));
      this.http
        .patch(url, body, API.options)
        .map(res => res.json())
        .subscribe(
          data => resolve(data),
          error => reject(error),
          () => console.log("User updated")
        );
    });
  }

  delete(user: User): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = this.endpoint + 'delete'
      let body = { 'user': user }
      this.http
        .post(url, body, API.options)
        .map(res => res.json())
        .subscribe(
          data => resolve(data),
          error => reject(error),
          () => console.log("User deleted")
        );
    });
  }
  authenticate(user) {
    return new Promise((resolve, reject) => {
      let url = this.endpoint + 'sign-in'
      let body = { 'user': user }
      this.http
        .post(url, body, API.options)
        .map(res => res.json())
        .subscribe(
          data => resolve(data),
          (error) => {
            if (error.status == 404) {
              reject("Email ou senha inválidos");
            } else {
              reject(error);
            }
          }, () => console.log("User found")
        );
    });
  }

  getUser(email: string): Promise<User> {
    return new Promise((resolve, reject) => {
      let url = ENV.API_URL + 'users?email=' + email;
      console.log("URL: " + url);
      console.log(JSON.stringify(API.options));
      this.http
        .get(url, API.options)
        .map(res => res.json())
        .subscribe(
          data => resolve(data as User),
          error => reject(error),
          () => console.log("Got user")
        );
    });
  }

}
