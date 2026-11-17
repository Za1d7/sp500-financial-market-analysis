import numpy as np, pandas as pd
from scipy.linalg import solve_discrete_lyapunov
from scipy.optimize import minimize

def build(phi,theta):
    p,q=len(phi),len(theta); r=max(p,q+1)
    ph=np.r_[phi,np.zeros(r-p)]; th=np.r_[1.0,theta,np.zeros(r-1-q)]
    T=np.zeros((r,r)); T[:,0]=ph; T[:r-1,1:]=np.eye(r-1)
    return T,th.reshape(-1,1),r

def kf(y,phi,theta,s2=1.0,init=None):
    """Return one-step preds, F, final state (a,P) for demeaned series y. sigma2 = s2."""
    T,R,r=build(phi,theta); Q=s2*(R@R.T)
    if init is None:
        a=np.zeros(r); P=solve_discrete_lyapunov(T,Q)
    else: a,P=init
    n=len(y); pred=np.empty(n); F=np.empty(n)
    for t in range(n):
        pred[t]=a[0]; F[t]=P[0,0]; v=y[t]-a[0]
        K=P[:,0]/F[t]
        a=a+K*v; P=P-np.outer(K,P[0,:])
        a=T@a; P=T@P@T.T+Q
    return pred,F,(a,P)

def negll(par,y,p=2,q=2):
    c=par[0]; phi=par[1:1+p]; th=par[1+p:1+p+q]
    # stationarity / invertibility guards
    if np.any(np.abs(np.roots(np.r_[1,-phi]))>=1-1e-6) or np.any(np.abs(np.roots(np.r_[1,th]))>=1-1e-6): return 1e10
    pred,F,_=kf(y-c,phi,th,1.0)
    v=(y-c)-pred; s2=np.mean(v**2/F)
    return 0.5*(len(y)*np.log(2*np.pi*s2)+np.sum(np.log(F))+len(y))

def fit(y,start):
    res=minimize(negll,start,args=(y,),method='Nelder-Mead',options=dict(xatol=1e-7,fatol=1e-9,maxiter=6000,maxfev=6000))
    res=minimize(negll,res.x,args=(y,),method='BFGS')
    c=res.x[0]; phi=res.x[1:3]; th=res.x[3:5]
    pred,F,_=kf(y-c,phi,th,1.0); s2=np.mean(((y-c)-pred)**2/F)
    return c,phi,th,s2,-res.fun
