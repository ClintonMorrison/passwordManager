package server

import (
	"net/http"
	"strings"
)

type RequestContext struct {
	username     string
	ip           string
	password     string // password from basic auth field
	sessionToken string
}

func (rc RequestContext) ToAuth(decryptToken string) Auth {
	return Auth{
		username: rc.username,
		password: decryptToken,
		ip:       rc.ip,
	}
}

func ParseBasicContext(r *http.Request) RequestContext {
	username, password, _ := r.BasicAuth()

	username = strings.ToLower(username)
	ip := r.Header.Get("X-Forwarded-For")

	cookies := ParseCookies(r)
	sesionToken := cookies["session"]

	return RequestContext{username, ip, password, sesionToken}
}
