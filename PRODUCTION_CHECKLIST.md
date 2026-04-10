# Production Deployment Checklist

Use this checklist when deploying Walto to production.

---

## Pre-Deployment

### Backend
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] API documentation updated
- [ ] Security audit completed
- [ ] Dependencies updated
- [ ] Secrets rotated
- [ ] Backup strategy in place

### Frontend  
- [ ] Testing completed
- [ ] UI/UX reviewed
- [ ] Performance optimized
- [ ] App icons/splash screen ready
- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] Analytics integrated
- [ ] Crash reporting setup

### Infrastructure
- [ ] Domain configured
- [ ] SSL certificates installed
- [ ] CDN setup (if needed)
- [ ] Monitoring tools configured
- [ ] Alerting rules set
- [ ] Backup automation enabled
- [ ] Scaling strategy defined
- [ ] Disaster recovery plan ready

---

## Deployment Day

### Step 1: Backend Deployment (30 min)
- [ ] Tag release: `git tag v1.0.0`
- [ ] Push to production: `railway up`
- [ ] Verify health: `curl https://api.yourapp.com/health`
- [ ] Run database migrations
- [ ] Test all endpoints
- [ ] Check logs for errors

### Step 2: Database (15 min)
- [ ] Backup current database
- [ ] Run migrations
- [ ] Verify data integrity
- [ ] Test queries
- [ ] Setup automated backups

### Step 3: Frontend Deployment (45 min)
- [ ] Update API URL in .env
- [ ] Build production APK: `eas build --platform android --profile production`
- [ ] Test APK on device
- [ ] Upload to distribution channel
- [ ] Generate release notes

### Step 4: Smoke Testing (20 min)
- [ ] User registration
- [ ] User login
- [ ] SMS parsing
- [ ] Transaction display
- [ ] Analytics accuracy
- [ ] Logout functionality
- [ ] Error handling

### Step 5: Monitoring (10 min)
- [ ] Enable error tracking
- [ ] Configure alerts
- [ ] Set up log aggregation
- [ ] Create status page
- [ ] Notify team of go-live

---

## Post-Deployment (First 24 Hours)

### Hour 1
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify user signups working
- [ ] Test from different devices

### Hour 4
- [ ] Review first 100 requests
- [ ] Check database performance
- [ ] Monitor API response times
- [ ] Verify no critical errors

### Hour 12
- [ ] User feedback review
- [ ] Performance analysis
- [ ] Resource usage check
- [ ] Cost tracking review

### Hour 24
- [ ] Full system health check
- [ ] User metrics review
- [ ] Bug triage
- [ ] Plan hotfixes if needed

---

## Week 1 Post-Launch

### Daily
- [ ] Monitor error dashboard
- [ ] Review user feedback
- [ ] Check resource usage
- [ ] Triage and fix bugs
- [ ] Update documentation

### End of Week
- [ ] Performance review meeting
- [ ] User metrics analysis
- [ ] Cost analysis
- [ ] Plan v1.1 features
- [ ] Team retrospective

---

## Rollback Plan

If critical issues arise:

### Backend Rollback
```powershell
# Railway
railway rollback [deployment-id]

# Verify rollback
curl https://api.yourapp.com/health
```

### Database Rollback
```powershell
# Restore from backup
railway run psql $DATABASE_URL < backup_before_deploy.sql
```

### Frontend Rollback
- Revert to previous APK version
- Notify users of update
- Provide support channels

---

## Emergency Contacts

**Technical Issues:**
- Backend Lead: [Name] - [Contact]
- Frontend Lead: [Name] - [Contact]
- DevOps: [Name] - [Contact]

**Business Issues:**
- Product Owner: [Name] - [Contact]
- Support Lead: [Name] - [Contact]

**Service Providers:**
- Railway Support: support@railway.app
- OpenAI Support: help.openai.com
- Expo Support: support@expo.dev

---

## Success Criteria

✅ Zero critical bugs in first 24 hours  
✅ <2% error rate  
✅ API response time <500ms (95th percentile)  
✅ 50+ user signups in first week  
✅ <5 support tickets per 100 users  
✅ 90%+ user retention day 1→day 7

---

## Sign-Off

**Approved By:**
- [ ] Backend Lead: _________________ Date: _______
- [ ] Frontend Lead: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______
- [ ] Product Owner: _________________ Date: _______

**Deployment Date:** __________________  
**Deployment Time:** __________________  
**Deployed By:** __________________

---

**After completing this checklist, proceed to monitoring and maintenance routines.**
