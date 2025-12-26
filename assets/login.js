/**
 *  @class
 *  @function  Login
 */

class Login {

    constructor() {
      this.registerForm = document.querySelector('form#create_customer');
      this.loginRecoverForm = document.querySelector('form[action="/account/recover"]');

      this.initRegisterForm();
    }

    initRegisterForm() {
      if (!this.registerForm) return;

      const submitEl = this.registerForm.querySelector('button[type="submit"]');
      if (!submitEl) return;

      const lastNameEl = this.registerForm.querySelector('input[name="customer[last_name]"]');
      const firstNameEl = this.registerForm.querySelector('input[name="customer[first_name]"]');
      const emailEl = this.registerForm.querySelector('input[name="customer[email]"]');
      const genderEls = this.registerForm.querySelectorAll('input[name="register[gender]"]');
      const birthYearEl = this.registerForm.querySelector('select[name="register[birth_year]"]');
      const birthMonthEl = this.registerForm.querySelector('select[name="register[birth_month]"]');
      const birthDayEl = this.registerForm.querySelector('select[name="register[birth_day]"]');
      const hasChildrenEls = this.registerForm.querySelectorAll('input[name="register[has_children]"]');
      const genderGroupEl = this.registerForm.querySelector('[data-required-group="gender"]');
      const hasChildrenGroupEl = this.registerForm.querySelector('[data-required-group="has_children"]');
      const childrenCountWrapEl = this.registerForm.querySelector('[data-children-count]');
      const childrenCountEl = this.registerForm.querySelector('select[name="register[children_count]"]');
      const childrenCountRequiredEl = this.registerForm.querySelector('[data-children-count-required]');
      const childrenDetailsWrapEl = this.registerForm.querySelector('[data-children-details]');
      const childDetailEls = this.registerForm.querySelectorAll('[data-child-detail]');
      const hasChildrenYesEl = this.registerForm.querySelector('[data-has-children-yes]');
      const passwordEl = this.registerForm.querySelector('input[name="customer[password]"]');
      const passwordConfirmEl = this.registerForm.querySelector('input[name="customer[password_confirmation]"]');
      const noteEl = this.registerForm.querySelector('[data-customer-note]');
      const returnToEl = this.registerForm.querySelector('input[name="return_to"]');

      function markInvalid(el, invalid) {
        if (!el) return true;
        if (invalid) {
          el.classList.add('invalid');
          return false;
        }
        el.classList.remove('invalid');
        return true;
      }

      function getCheckedValue(els) {
        if (!els || !els.length) return '';
        const checked = Array.from(els).find((el) => el && el.checked);
        return checked ? checked.value : '';
      }

      function markGroupInvalid(groupEl, invalid) {
        if (!groupEl) return true;
        if (invalid) {
          groupEl.classList.add('invalid');
          return false;
        }
        groupEl.classList.remove('invalid');
        return true;
      }

      function setChildrenCountVisible(visible) {
        if (!childrenCountWrapEl) return;
        childrenCountWrapEl.style.display = visible ? '' : 'none';

        if (childrenCountRequiredEl) {
          childrenCountRequiredEl.style.display = visible ? '' : 'none';
        }

        if (!visible && childrenCountEl) {
          childrenCountEl.value = '';
          childrenCountEl.required = false;
          childrenCountEl.classList.remove('invalid');
        }
        if (visible && childrenCountEl) {
          childrenCountEl.required = true;
        }
      }

      function setChildrenDetailsVisible(visible) {
        if (!childrenDetailsWrapEl) return;
        childrenDetailsWrapEl.style.display = visible ? '' : 'none';

        if (!visible && childDetailEls && childDetailEls.length) {
          childDetailEls.forEach((wrap) => {
            wrap.style.display = 'none';
            wrap.querySelectorAll('input, select').forEach((el) => {
              if (el.tagName === 'SELECT') el.value = '';
              else el.value = '';
              el.classList.remove('invalid');
            });
          });
        }
      }

      function updateChildDetailsByCount() {
        const hasChildrenValue = getCheckedValue(hasChildrenEls);
        const count = childrenCountEl && childrenCountEl.value ? parseInt(childrenCountEl.value, 10) : 0;

        const shouldShow = hasChildrenValue === 'はい' && count > 0;
        setChildrenDetailsVisible(shouldShow);
        if (!shouldShow) return;

        if (!childDetailEls || !childDetailEls.length) return;

        childDetailEls.forEach((wrap) => {
          const idx = parseInt(wrap.getAttribute('data-child-index') || '0', 10);
          const active = idx > 0 && idx <= count;
          wrap.style.display = active ? '' : 'none';
          if (!active) {
            wrap.querySelectorAll('input, select').forEach((el) => {
              if (el.tagName === 'SELECT') el.value = '';
              else el.value = '';
              el.classList.remove('invalid');
            });
          }
        });
      }

      if (hasChildrenEls && hasChildrenEls.length) {
        hasChildrenEls.forEach((el) => {
          el.addEventListener('change', function () {
            markGroupInvalid(hasChildrenGroupEl, getCheckedValue(hasChildrenEls) === '');
            const isYes = hasChildrenYesEl ? hasChildrenYesEl.checked : getCheckedValue(hasChildrenEls) === 'はい';
            setChildrenCountVisible(isYes);
            if (!isYes) {
              setChildrenDetailsVisible(false);
            }
            updateChildDetailsByCount();
          });
        });
      }

      if (genderEls && genderEls.length) {
        genderEls.forEach((el) => {
          el.addEventListener('change', function () {
            markGroupInvalid(genderGroupEl, getCheckedValue(genderEls) === '');
          });
        });
      }

      if (childrenCountEl) {
        childrenCountEl.addEventListener('change', function () {
          updateChildDetailsByCount();
        });
      }

      submitEl.addEventListener('click', function (e) {
        e.preventDefault();

        const isLastNameValid = markInvalid(lastNameEl, !lastNameEl || lastNameEl.value.trim() === '');
        const isFirstNameValid = markInvalid(firstNameEl, !firstNameEl || firstNameEl.value.trim() === '');
        const isEmailValid = markInvalid(emailEl, !emailEl || emailEl.value.trim() === '');
        const genderValue = getCheckedValue(genderEls);
        const isGenderValid = genderEls && genderEls.length ? genderValue !== '' : true;
        const hasChildrenValue = getCheckedValue(hasChildrenEls);
        const isHasChildrenValid = hasChildrenEls && hasChildrenEls.length ? hasChildrenValue !== '' : true;
        const isChildrenCountValid =
          hasChildrenValue === 'はい'
            ? markInvalid(childrenCountEl, !childrenCountEl || childrenCountEl.value.trim() === '')
            : true;
        const isBirthYearValid = markInvalid(birthYearEl, !birthYearEl || birthYearEl.value.trim() === '');
        const isBirthMonthValid = markInvalid(birthMonthEl, !birthMonthEl || birthMonthEl.value.trim() === '');
        const isBirthDayValid = markInvalid(birthDayEl, !birthDayEl || birthDayEl.value.trim() === '');
        const isPasswordValid = markInvalid(passwordEl, !passwordEl || passwordEl.value.trim() === '');
        const isPasswordConfirmValid = markInvalid(
          passwordConfirmEl,
          !passwordConfirmEl || passwordConfirmEl.value.trim() === '' || passwordConfirmEl.value !== passwordEl.value
        );

        markGroupInvalid(genderGroupEl, !isGenderValid);
        markGroupInvalid(hasChildrenGroupEl, !isHasChildrenValid);

        if (
          isLastNameValid &&
          isFirstNameValid &&
          isEmailValid &&
          isGenderValid &&
          isHasChildrenValid &&
          isChildrenCountValid &&
          isBirthYearValid &&
          isBirthMonthValid &&
          isBirthDayValid &&
          isPasswordValid &&
          isPasswordConfirmValid
        ) {
          if (noteEl) {
            const noteLines = [];
            if (genderValue) {
              let sexToken = '';
              if (genderValue === '女性') sexToken = 'sex-female';
              else if (genderValue === '男性') sexToken = 'sex-male';
              else if (genderValue === 'その他') sexToken = 'sex-other';
              if (sexToken) noteLines.push(sexToken);
            }
            if (birthYearEl && birthMonthEl && birthDayEl && birthYearEl.value && birthMonthEl.value && birthDayEl.value) {
              const yyyy = birthYearEl.value;
              const mm = String(birthMonthEl.value).padStart(2, '0');
              const dd = String(birthDayEl.value).padStart(2, '0');
              noteLines.push(`DOB-${yyyy}-${mm}-${dd}`);
            }
            if (hasChildrenValue === 'はい') {
              noteLines.push('children-yes');
              if (childrenCountEl && childrenCountEl.value) {
                noteLines.push(`nop-${childrenCountEl.value}`);
              }

              const childCount = childrenCountEl && childrenCountEl.value ? parseInt(childrenCountEl.value, 10) : 0;
              if (childCount > 0) {
                for (let i = 1; i <= childCount; i++) {
                  const childSexEl = this.closest('form').querySelector(`select[name="register[child_${i}_sex]"]`);
                  const childAgeEl = this.closest('form').querySelector(`input[name="register[child_${i}_age]"]`);

                  const childSex = childSexEl && childSexEl.value ? childSexEl.value.trim() : '';
                  const childAge = childAgeEl && childAgeEl.value ? String(childAgeEl.value).trim() : '';

                  if (childSex) {
                    noteLines.push(`c${i}-sex-${childSex}`);
                  }
                  if (childAge) {
                    noteLines.push(`c${i}-age-${childAge}`);
                  }
                }
              }
            } else if (hasChildrenValue === 'いいえ') {
              noteLines.push('children-no');
            }
            noteEl.value = noteLines.join('\n');
          }

          this.closest('form').submit();
        }
      });
    }
  }
  window.addEventListener('load', () => {
    if (typeof Login !== 'undefined') {
      new Login();
    }
  });