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
    // console.log(this.#catchCbs)
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
    this.$state = STATE.REJECTED
    // 执行catch回调
    this.#runCallBacks()
  }
  
  then(cb) {
    this.#thenCbs.push(cb)
  }
}