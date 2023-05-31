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
    console.log(this.#state)
    if (this.#state === STATE.FULFILLED) {
      this.#thenCbs.forEach(cb => {
        cb(this.#value)
      })
      this.#thenCbs = []
    }
    // console.log(this.#catchCbs)
    // console.log(this.#state === STATE.REJECTED)
    if (this.#state === STATE.REJECTED) {
      this.#catchCbs.forEach(cb => {
        
        cb(this.#value)
      })
      this.#catchCbs = []
    }
  }

  // 私有方法
  #onSuccess(value) {
    // 用户调用了resolve
    if (this.#state !== STATE.PENDING) return
    // resolve传过来的值
    this.#value = value
    // 修改状态
    this.#state = STATE.FULFILLED
    // 执行then回调
    this.#runCallBacks()
  }

  // 私有方法
  #onFail(value) {
    // 用户调用了reject
    if (this.#state !== STATE.PENDING) return
    this.#value = value
    this.#state = STATE.REJECTED
    // 执行catch回调
    this.#runCallBacks()
  }
  
  then(thenCb, catchCb) {
    return new MyPromise((resolve, reject) => {
      // console.log(thenCb)
      // resolve onSuccess
      // reject onFail
      // thenCb: 
      // 1.有可能没有回调
      // 2.如果有回调需要将回调的返回值继续传递给下一个then
      this.#thenCbs.push((res) => {
        // console.log(thenCb)
        if (thenCb == null) {
          console.log(res)
          // onSuccess
          resolve(res)
          return
        }
        try {
          // 如果传了对调 将回调的返回值传递给下一个then
          resolve(thenCb(res))
        } catch (err) {
          reject(error)
        }
      })

      this.#catchCbs.push((res) => {
        if (catchCb == null) {
          reject(res)
          return
        }
        try {
          resolve(catchCb(resolve))
        } catch (err) {
          reject(error)
        }
      })
      this.#runCallBacks()
    })
    
  }

  catch(cb) {
    return this.then(undefined, cb)
  }
}