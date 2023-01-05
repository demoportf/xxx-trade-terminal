FROM nginx:1.14.2
COPY ./entrypoint.sh /
COPY dist /usr/share/nginx/html
