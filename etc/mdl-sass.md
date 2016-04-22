# Important SASS variables in MDL

### ./application-spesific-sass-file.scss
```sass
body {
    background-color: $application-spesific-setting;
}
```

### src/resets/_h5bp.scss
```sass
html {
    color: $text-color-primary;
    font-size: 1em;
    line-height: 1.4;
}
```

### src/palette/_palette.scss
```sass
// Primary and accent

.mdl-color--primary {
  background-color: unquote("rgb(#{$color-primary})") !important;
}

.mdl-color--primary-contrast {
  background-color: unquote("rgb(#{$color-primary-contrast})") !important;
}

.mdl-color--primary-dark {
  background-color: unquote("rgb(#{$color-primary-dark})") !important;
}

.mdl-color--accent {
  background-color: unquote("rgb(#{$color-accent})") !important;
}

.mdl-color--accent-contrast {
  background-color: unquote("rgb(#{$color-accent-contrast})") !important;
}

.mdl-color-text--primary {
  color: unquote("rgb(#{$color-primary})") !important;
}

.mdl-color-text--primary-contrast {
  color: unquote("rgb(#{$color-primary-contrast})") !important;
}

.mdl-color-text--primary-dark {
  color: unquote("rgb(#{$color-primary-dark})") !important;
}

.mdl-color-text--accent {
  color: unquote("rgb(#{$color-accent})") !important;
}

.mdl-color-text--accent-contrast {
  color: unquote("rgb(#{$color-accent-contrast})") !important;
}
```


### src/typography/_typography.scss
```sass
a {
  color: $text-link-color;
  font-weight: 500;
}
```
