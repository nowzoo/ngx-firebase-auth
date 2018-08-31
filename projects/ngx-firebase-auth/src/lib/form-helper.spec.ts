import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { NgxFirebaseAuthFormHelper } from './form-helper';

describe('NgxFirebaseAuthService', () => {
  describe('setErrorUntilChanged', () => {
    let fc: FormControl;
    beforeEach(() => {
      fc = new FormControl('foo');
    });
    it('should set the error for as long as the control remains unchanged', () => {
      NgxFirebaseAuthFormHelper.setErrorUntilChanged(fc, 'some-error');
      expect(fc.hasError('some-error')).toBe(true);
      fc.setValue('bar');
      expect(fc.hasError('some-error')).toBe(false);
    });
  });

  describe('clearError', () => {
    let fc: FormControl;
    beforeEach(() => {
      fc = new FormControl('foo');
    });
    it('should clear the key if there are multiple errors', () => {
      fc.setErrors({foo: true, bar: true});
      NgxFirebaseAuthFormHelper.clearError(fc, 'foo');
      expect(fc.errors).toEqual({bar: true});
    });
    it('should clear the key if there is one error', () => {
      fc.setErrors({foo: true});
      NgxFirebaseAuthFormHelper.clearError(fc, 'foo');
      expect(fc.errors).toEqual(null);
    });
  });

  describe('requiredNonEmpty', () => {
    let fc: FormControl;
    beforeEach(() => {
      fc = new FormControl('foo');
    });
    it('should return required error for ""', () => {
      fc.setValue('');
      expect(NgxFirebaseAuthFormHelper.requiredNonEmpty(fc)).toEqual({required: true});
    });
    it('should return required error for "      "', () => {
      fc.setValue('     ');
      expect(NgxFirebaseAuthFormHelper.requiredNonEmpty(fc)).toEqual({required: true});
    });
    it('should return null for "bar"', () => {
      fc.setValue('bar');
      expect(NgxFirebaseAuthFormHelper.requiredNonEmpty(fc)).toEqual(null);
    });
    it('should return null for " bar "', () => {
      fc.setValue(' bar ');
      expect(NgxFirebaseAuthFormHelper.requiredNonEmpty(fc)).toEqual(null);
    });
    it('should return null for non string', () => {
      fc.setValue(88);
      expect(NgxFirebaseAuthFormHelper.requiredNonEmpty(fc)).toEqual(null);
    });
  });

});
