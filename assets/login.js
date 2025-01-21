/**
 *  @class
 *  @function  Login
 */

class Login {

    constructor() {
      this.loginForm = document.querySelector('form#create_customer');
      const submitEl = this.loginForm.querySelector('button[type="submit"]');
      const firstNameEl = this.loginForm.querySelector('input[name="customer[last_name]"]');
      const lastNameEl = this.loginForm.querySelector('input[name="customer[first_name]"]');
      const emailEl = this.loginForm.querySelector('input[name="customer[email]"]');
      const passwordEl = this.loginForm.querySelector('input[name="customer[password]"]');
      const passwordConfirmEl = this.loginForm.querySelector('input[name="customer[password_confirmation]"]');
      submitEl.addEventListener('click', function(e) {
        e.preventDefault();
        function setStyle(el, status) {
            if(el.value === '' || status){
                el.parentElement.querySelector('label').setAttribute('for', 'last_name invalid')
                el.classList.add('invalid');
                return false
            }else{
                el.parentElement.querySelector('label').setAttribute('for', 'last_name')
                el.classList.remove('invalid');
            }
        }
        setStyle(firstNameEl);
        setStyle(lastNameEl);
        setStyle(emailEl);
        setStyle(passwordEl);
        if(passwordEl.value && passwordConfirmEl.value !== passwordEl.value){
            setStyle(passwordConfirmEl, true);
        }
        if(firstNameEl.value && lastNameEl.value && emailEl.value && passwordEl.value && passwordConfirmEl.value === passwordEl.value ){
            document.querySelector('form#create_customer').submit();
        }
      })
    }
  }
  window.addEventListener('load', () => {
    if (typeof Login !== 'undefined') {
      new Login();
    }
  });