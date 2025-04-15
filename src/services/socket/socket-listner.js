import { getSocket } from "./index";

export function socketListener(eventName, cb) {
  getSocket()
    .off(eventName)
    .on(eventName, (message) => {
      return cb(null, message);
    });
}

export function socketEmitter(eventName, data) {
  getSocket().emit(eventName, data);
}
