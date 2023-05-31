const STATE = {
  FULFILLED: 'fulfilled',
  REJECTED: 'rejected',
  PENDING: 'pending'
}
class MyPromise {
  // 存储成功回调
  #thenCbs = []
  // 存储失败的回调
  #catchCbs = []
  // 异步状态
  #state = STATE.PENDING
  // 存储异步结果
  #value

  constructor(excutor) {
    try {
      excutor(this.#onSuccess.bind(this), this.#onFail.bind(this))
    } catch (e) {
      this.#onFail(e)
    }
  }

  #runCallBacks() {
    if (this.#state === STATE.FULFILLED) {
      this.#thenCbs.forEach(cb => {
        cb(this.#value)
      })
      this.#thenCbs = []
    }
    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach(cb => {
        
        cb(this.#value)
      })
      this.#catchCbs = []
    }
  }

  // 私有方法
  #onSuccess(value) {
    queueMicrotask(() => {
      // 用户调用了resolve
      if (this.#state !== STATE.PENDING) return
      // 处理返回值为Promise
      if (value instanceof MyPromise) {
        value.then(this.#onSuccess.bind(this), this.#onFail.bind(this))
        return
      }
      // resolve传过来的值
      this.#value = value
      // 修改状态
      this.#state = STATE.FULFILLED
      // 执行then回调
      this.#runCallBacks()
    })
  }

  // 私有方法
  #onFail(value) {
    queueMicrotask(() => {
      // 用户调用了reject
      if (this.#state !== STATE.PENDING) return
      if (value instanceof MyPromise) {
        value.then(this.#onSuccess.bind(this), this.#onFail.bind(this))
        return
      }

      // 处理MyPromise传递非函数
      if (this.#catchCbs.length === 0) {
        throw value
      }
      this.#value = value
      this.#state = STATE.REJECTED
      // 执行catch回调
      this.#runCallBacks()
    })
  }
  
  then(thenCb, catchCb) {
    return new MyPromise((resolve, reject) => {
      // resolve onSuccess
      // reject onFail
      // thenCb: 
      // 1.有可能没有回调
      // 2.如果有回调需要将回调的返回值继续传递给下一个then
      this.#thenCbs.push((res) => {
        if (thenCb == null) {
          // onSuccess
          resolve(res)
          return
        }
        try {
          // 如果传了对调 将回调的返回值传递给下一个then
          resolve(thenCb(res))
        } catch (err) {
          reject(err)
        }
      })

      this.#catchCbs.push((res) => {
        if (catchCb == null) {
          reject(res)
          return
        }
        try {
          resolve(catchCb(res))
        } catch (err) {
          reject(err)
        }
      })
      this.#runCallBacks()
    })
    
  }

  catch(cb) {
    return this.then(undefined, cb)
  }

  // 不管成功还是失败均执行
  finally(cb) {
    return this.then((result) => {
      cb(result)
      return result
    }, (err) => {
      cb(err)
      throw new Error(err)
    })
  }

  static resolve(value) {
    return new MyPromise((resolve) => {
      resolve(value)
    })
  }

  static resolve(value) {
    return new MyPromise((resolve, reject) => {
      reject(value)
    })
  }

  static all(promises) {
    const results = []
    let completePromises = 0
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise.then((res) => {
          // 按照下标进行存储
          results[i] = res
          completePromises++
          if (completePromises === promises.length) {
            resolve(results)
          }
        }).catch(reject)
      }
    })
  }

  static allSettled(promises) {
    const results = []
    let completePromises = 0
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise.then((res) => {
          // 按照下标进行存储
          results[i] = {
            status: STATE.FULFILLED,
            value: res
          }
        }).catch(reason => {
          results[i] = {
            status: STATE.REJECTED,
            reason
          }
        }).finally(() => {
          completePromises++
          if (completePromises === promises.length) {
            resolve(results)
          }
        })
      }
    })
  }

  static race(promises) {
    return new MyPromise((resolve, reject) => {
      promises.forEach(promise => {
        promise.then(resolve).catch(reject)
      })
    })
  }

  static any(promises) {
    const errors = []
    let rejectedPromises = 0
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const promise = promises[i]
        promise.then(resolve).catch(value => {
          // 按照下标进行存储
          errors[i] = value
          rejectedPromises++
          if (rejectedPromises === promises.length) {
            reject(errors)
          }
        })
      }
    })
  }
}