import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { getOAuthProviderName, getOAuthProviderIcon } from './shared';

describe('getOAuthProviderName', () => {
  it('should return the right names', () => {
    expect(getOAuthProviderName('google.com')).toBe('Google');
    expect(getOAuthProviderName('twitter.com')).toBe('Twitter');
    expect(getOAuthProviderName('facebook.com')).toBe('Facebook');
    expect(getOAuthProviderName('github.com')).toBe('GitHub');
    expect(getOAuthProviderName('foo.com')).toBe('foo.com');
  });

});

describe('getOAuthProviderIcon', () => {
  it('should return the right names', () => {
    expect(getOAuthProviderIcon('google.com')).toBe('fab fa-fw fa-google');
    expect(getOAuthProviderIcon('twitter.com')).toBe('fab fa-fw fa-twitter');
    expect(getOAuthProviderIcon('facebook.com')).toBe('fab fa-fw fa-facebook');
    expect(getOAuthProviderIcon('github.com')).toBe('fab fa-fw fa-github');
    expect(getOAuthProviderIcon('foo.com')).toBe('fas fa-fw fa-sign-in-alt');
  });

});
