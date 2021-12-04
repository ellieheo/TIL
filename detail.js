const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { db } = require("../models/index");
const dotenv = require('dotenv');
const { restart } = require('pm2');
const { request } = require('express');
// const { ConnectContactLens } = require('aws-sdk');
// const logger = require("../src/config/logger")
dotenv.config();
// const util = require('util'); //현재시간을 찍어주는 모듈
// const { JsonWebTokenError } = require('jsonwebtoken');

//산책 약속페이지 등록하기
router.post('/write/:userId', async (req, res) => {
  console.log("write post 연결완료!")
  const completed = 0;
  const {userId} =req.params
  // const userId = res.locals.user.userId;
  console.log("유저 들어오니", userId)

  try {
    const {meetingDate,wishDesc,locationCategory, dogCount,totalTime,startLocationAddress,endLocationAddress,totalDistance,routeColor,routeName} = req.body;
    console.log("reqBody", meetingDate,wishDesc,locationCategory, dogCount,totalTime,startLocationAddress,endLocationAddress,totalDistance,routeColor,routeName)
    const params= [
      meetingDate,
      wishDesc,
      completed,
      locationCategory,
      dogCount,
      totalTime,
      startLocationAddress,
      endLocationAddress,
      totalDistance,
      routeColor,
      routeName,
      userId,
    ];
    const query =
    'INSERT INTO post (meetingDate,wishDesc,completed,locationCategory,dogCount,totalTime,startLocationAddress,endLocationAddress,totalDistance,routeColor,routeName, userId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
      await db.query(query, params, (error, rows, fields) => {
        console.log("row는",rows)
        if (error) {
          console.log(error)
          // logger.error('게시글 저장 중 DB관련 에러가 발생 했습니다', error);
          return res.status(400).json({
            success: false,
            errMessage: '400 에러 게시중 오류가 발생 하였습니다!.'
          });
        }
        // logger.info(`${userNickname}님, 게시글 등록이 완료되었습니다.`);
        return res.status(201).json({
          success: true,
          Message: '게시글이 성공적으로 포스팅 되었습니다!.'
        });
      });
    } catch (err) {
      // logger.error('게시글 작성 중 에러가 발생 했습니다: ', err);
      return res.status(500).json({
        success: false,
        errMessage: '500 에러 게시중 오류가 발생 하였습니다!.'
      });
    }
  })

  // 게시글 삭제
  router.delete('/:postId/:userId', async (req, res) => {
    const  {postId,userId}  = req.params;
    // const userId = res.locals.user.userId;
    console.log("삭제0",postId,userId)
    console.log("삭제1",req)
    const query = `DELETE from post where postId = ${postId} and userId = '${userId}'`;
    try {
      await db.query(query, (error, rows, fields) => {
        if (error) {
          console.log("삭제2",error)
          // logger.error('게시글 삭제 중 쿼리문 에러가 발생하였습니다. :', error);
          return res.status(400).json({
            success: false,
          });
        }
        // logger.info('게시글을 성공적으로 삭제하였습니다.');
        console.log("삭제성공")
        res.status(200).json({
          success: true,
        });
      });
    } catch (err) {
      res.status(500).json({ err: err });
      // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    }
  });


//메인 페이지 조회하기 - 올림픽 공원
router.get('/main/olympicPark', async (req, res) => {
  console.log("get method 연결완료!")
  const location = "올림픽공원"
  try {
    const postCount = `SELECT count(*) as count FROM post where post.locationCategory = '${location}'`;
    const results = await db.query(postCount);
    console.log("results", results); //[ RowDataPacket { count: 13 } ]
    const totalCount = results[0].count; // NOTE: 전체 글 개수.
    console.log("totoal",totalCount)
    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory,
    (select count(*) from post where post.locationCategory ='${location}') as length
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC
    LIMIT 4`
    await db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      console.log(totalCount)
      res.status(200).json({
        success: true,
        posts: rows,
        totalCount
      });
      console.log("rows는", rows)
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});

//메인 페이지 조회하기 - 반포 공원
router.get('/main/banpoPark', async (req, res, next) => {
  console.log("get method 연결완료!")
  const location = "반포한강공원"
  const postCount = `SELECT count(*) as count FROM post where post.locationCategory = '${location}'`;
    const results = await db.query(postCount);
    console.log("results", results); //[ RowDataPacket { count: 13 } ]
    const totalCount = results[0].count; // NOTE: 전체 글 개수.
    console.log("totoal",totalCount)
  try {
    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory,
    (select count(*) from post where post.locationCategory ='${location}') as length
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC
    LIMIT 4`
    console.log('query', typeof query);

    await db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      res.status(200).json({
        success: true,
        posts: rows,
        totalCount
      });
      console.log("rows는", rows)
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }

});

//메인 페이지 조회하기 - 서울 숲
router.get('/main/seoulForest', async (req, res, next) => {
  console.log("get method 연결완료!")
  const location = "서울숲"
  const postCount = `SELECT count(*) as count FROM post where post.locationCategory = '${location}'`;
  const results = await db.query(postCount);
  console.log("results", results); //[ RowDataPacket { count: 13 } ]
  const totalCount = results[0].count; // NOTE: 전체 글 개수.
  console.log("totoal",totalCount)
  try {
    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory,
    (select count(*) from post where post.locationCategory ='${location}') as length
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC
    LIMIT 4`
    console.log('query', typeof query);

    await db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      res.status(200).json({
        success: true,
        posts: rows,
        totalCount
      });
      console.log("rows는", rows)
      // logger.info('게시글을 성공적으로 조회했습니다.');
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});

//메인 조회하기 - 올림픽 공원
router.get('/olympicPark', function (req, res, next) {
  console.log("get method 연결완료!")
  const location = "올림픽공원"
  try {

    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC `
    console.log('query', typeof query);

    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      res.status(200).json({
        success: true,
        posts: rows,
      });
      console.log("rows는", rows)
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});

//메인 조회하기 - 반포 한강공원
router.get('/banpoPark', function (req, res, next) {
  console.log("get method 연결완료!")
  const location = "반포한강공원"
  try {

    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC `
    console.log('query', typeof query);

    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      res.status(200).json({
        success: true,
        posts: rows,
      });
      console.log("rows는", rows)
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});

//메인 조회하기 - 서울숲
router.get('/seoulForest', function (req, res, next) {
  console.log("get method 연결완료!")
  try {

    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    where post.locationCategory ="서울숲"
    ORDER BY post.createdAt DESC`
    console.log('query', typeof query);

    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      res.status(200).json({
        success: true,
        posts: rows,
      });
      console.log("rows는", rows)
      // logger.info('게시글을 성공적으로 조회했습니다.');
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});

//메인 조회하기 - 전체 조회하기
router.get('/', function (req, res, next) {
  let conditions = [];
  let where
  console.log("get method 연결완료!")
  const {dogSize, dogGender, dogAge, locationCategory, completed} = req.body;
  console.log(dogSize, dogGender, dogAge, locationCategory, completed)
  try {

    const query = `SELECT
    dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    ORDER BY post.createdAt DESC`
    console.log('query', typeof query);
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      res.status(200).json({
        success: true,
        posts: rows,
      });
      console.log("rows는", rows)
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});

//메인 조회하기 - 전체 조회하기(테스트)
router.get('/test', function (req, res, next) {
  console.log("get method 연결완료!")
  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  console.log(pageNum)
  const contentSize = 10; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.
  console.log("다음 페이지 갈 때 건너뛸 리스트 개수.", skipSize)
  const query = `SELECT count(*) as count
    FROM post`
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
      console.log("전체 글 개수",totalCount)
      const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
      console.log("페이지네이션의 전체 카운트 ",pnTotal)
      const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize); // NOTE: 현재 페이지의 페이지네이션 시작 번호.
      console.log("현재 페이지의 페이지네이션 시작 번호", pnStart)
      let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
      console.log("현재 페이지의 페이지네이션 끝 번호",pnEnd)
      const query2 = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
      post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
      FROM post
      JOIN dog
      ON dog.userId=post.userId
      ORDER BY post.createdAt DESC
      LIMIT ${skipSize},${contentSize}`
      console.log(query2)
      db.query(query2, (error, results) => {
        console.log("들어오니")
        if (error) {
          console.log(error)
          // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
          return res.sendStatus(400);
        }
        console.log("찐결과",results)
        if (pnEnd>pnTotal) pnEnd = pnTotal;
        console.log(pnEnd,pnTotal)
        const result = {
          pageNum,
          pnStart,
          pnEnd,
          pnTotal,
          contents : results
        };
        res.status(200).json({
          success: true,
          posts: result,
        })
      console.log("rows는", rows)
    });
  });
});

//메인 조회하기 - 올림픽 공원(테스트)
router.get('/test/olympicPark', function (req, res, next) {
  console.log("get method 연결완료!")
  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  console.log(pageNum)
  const contentSize = 10; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum-1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.
  console.log("다음 페이지 갈 때 건너뛸 리스트 개수.", skipSize)
  const location = "올림픽공원"
  const query = `SELECT count(*) as count
    FROM post
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC `
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
      console.log("전체 글 개수",totalCount)
      const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
      console.log("페이지네이션의 전체 카운트 ",pnTotal)
      const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
      console.log("현재 페이지의 페이지네이션 시작 번호", pnStart)
      let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
      console.log("현재 페이지의 페이지네이션 끝 번호",pnEnd)
      const query2 = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
      post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
      FROM post
      JOIN dog
      ON dog.userId=post.userId
      where post.locationCategory ='${location}'
      ORDER BY post.createdAt DESC
      LIMIT ${skipSize},${contentSize}`
      console.log(query2)
      db.query(query2, (error, results) => {
        console.log("들어오니")
        if (error) {
          console.log(error)
          // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
          return res.sendStatus(400);
        }
        console.log("찐결과",results)
        if (pnEnd>pnTotal) pnEnd = pnTotal;
        console.log(pnEnd,pnTotal)
        const result = {
          pageNum,
          pnStart,
          pnEnd,
          pnTotal,
          contents : results
        };
        res.status(200).json({
          success: true,
          posts: result,
        })
      console.log("rows는", rows)
    });
  });
});

//메인 조회하기 - 서울숲(테스트)
router.get('/test/seoulForest', function (req, res, next) {
  console.log("get method 연결완료!")
  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  console.log(pageNum)
  const contentSize = 10; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.
  console.log("다음 페이지 갈 때 건너뛸 리스트 개수.", skipSize)
  const location = "서울숲"
  const query = `SELECT count(*) as count
    FROM post
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC `
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
      console.log("전체 글 개수",totalCount)
      const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
      console.log("페이지네이션의 전체 카운트 ",pnTotal)
      const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
      console.log("현재 페이지의 페이지네이션 시작 번호", pnStart)
      let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
      console.log("현재 페이지의 페이지네이션 끝 번호",pnEnd)
      const query2 = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
      post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
      FROM post
      JOIN dog
      ON dog.userId=post.userId
      where post.locationCategory ='${location}'
      ORDER BY post.createdAt DESC
      LIMIT ${skipSize},${contentSize}`
      console.log(query2)
      db.query(query2, (error, results) => {
        console.log("들어오니")
        if (error) {
          console.log(error)
          // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
          return res.sendStatus(400);
        }
        console.log("찐결과",results)
        if (pnEnd>pnTotal) pnEnd = pnTotal;
        console.log(pnEnd,pnTotal)
        const result = {
          pageNum,
          pnStart,
          pnEnd,
          pnTotal,
          contents : results
        };
        res.status(200).json({
          success: true,
          posts: result,
        })
      console.log("rows는", rows)
    });
  });
});

//메인 조회하기 - 반포한강공원(테스트)
router.get('/test/banpoPark', function (req, res, next) {
  console.log("get method 연결완료!")
  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  console.log(pageNum)
  const contentSize = 10; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.
  console.log("다음 페이지 갈 때 건너뛸 리스트 개수.", skipSize)
  const location = "반포한강공원"
  const query = `SELECT count(*) as count
    FROM post
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC `
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
      console.log("전체 글 개수",totalCount)
      const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
      console.log("페이지네이션의 전체 카운트 ",pnTotal)
      const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize) + 1; // NOTE: 현재 페이지의 페이지네이션 시작 번호.
      console.log("현재 페이지의 페이지네이션 시작 번호", pnStart)
      let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
      console.log("현재 페이지의 페이지네이션 끝 번호",pnEnd)
      const query2 = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
      post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
      FROM post
      JOIN dog
      ON dog.userId=post.userId
      where post.locationCategory ='${location}'
      ORDER BY post.createdAt DESC
      LIMIT ${skipSize},${contentSize}`
      console.log(query2)
      db.query(query2, (error, results) => {
        console.log("들어오니")
        if (error) {
          console.log(error)
          // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
          return res.sendStatus(400);
        }
        console.log("찐결과",results)
        if (pnEnd>pnTotal) pnEnd = pnTotal;
        console.log(pnEnd,pnTotal)
        const result = {
          pageNum,
          pnStart,
          pnEnd,
          pnTotal,
          contents : results
        };
        res.status(200).json({
          success: true,
          posts: result,
        })
      console.log("rows는", rows)
    });
  });
});

//(테스트)
router.get('/page/olympicPark', function (req, res, next) {
  console.log("get method 연결완료!")
  const pageNum = Number(req.query.pageNum) || 1; // NOTE: 쿼리스트링으로 받을 페이지 번호 값, 기본값은 1
  console.log(pageNum)
  const contentSize = 10; // NOTE: 페이지에서 보여줄 컨텐츠 수.
  const pnSize = 10; // NOTE: 페이지네이션 개수 설정.
  const skipSize = (pageNum - 1) * contentSize; // NOTE: 다음 페이지 갈 때 건너뛸 리스트 개수.
  console.log("다음 페이지 갈 때 건너뛸 리스트 개수.", skipSize)
  const location = "올림픽공원"
  const query = `SELECT count(*) as count
    FROM post
    where post.locationCategory ='${location}'
    ORDER BY post.createdAt DESC `
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      const totalCount = Number(rows[0].count); // NOTE: 전체 글 개수.
      console.log("전체 글 개수",totalCount)
      const pnTotal = Math.ceil(totalCount / contentSize); // NOTE: 페이지네이션의 전체 카운트
      console.log("페이지네이션의 전체 카운트 ",pnTotal)
      const pnStart = ((Math.ceil(pageNum / pnSize) - 1) * pnSize); // NOTE: 현재 페이지의 페이지네이션 시작 번호.
      console.log("현재 페이지의 페이지네이션 시작 번호", pnStart)
      let pnEnd = (pnStart + pnSize) - 1; // NOTE: 현재 페이지의 페이지네이션 끝 번호.
      console.log("현재 페이지의 페이지네이션 끝 번호",pnEnd)
      const query2 = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
      post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
      FROM post
      JOIN dog
      ON dog.userId=post.userId
      where post.locationCategory ='${location}'
      ORDER BY post.createdAt DESC
      LIMIT ${skipSize},${contentSize}`
      console.log(query2)
      db.query(query2, (error, results) => {
        console.log("들어오니")
        if (error) {
          console.log(error)
          // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
          return res.sendStatus(400);
        }
        console.log("찐결과",results)
        if (pnEnd>pnTotal) pnEnd = pnTotal;
        console.log(pnEnd,pnTotal)
        const result = {
          pageNum,
          pnStart,
          pnEnd,
          pnTotal,
          contents : results
        };
        res.status(200).json({
          success: true,
          posts: result,
        })
      console.log("rows는", rows)
    });
  });
});




//산책 약속 상세 조회하기
router.get('/:postId', auth, async function (req, res, next) {
  const {postId} = req.params;
  const userId = res.locals.user.userId;
  try {
    // let existRequest
    // const check = `SELECT notification.checkRequest from notification
    // where notification.postId =${postId} and notification.senderId = ${userId}`
    // let requestCheck = await db.query(check)
    // existRequest = requestCheck[0]
    // if (!existRequest) {
    //   existRequest = 0
    // } else existRequest = 1
    // const requestCheck = request[0].checkRequest
    const query =
    `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage,
    post.userId, post.postId, post.meetingDate, post.wishDesc, post.locationCategory, post.dogCount, post.createdAt, post.completed, post.totalTime, post.startLocationAddress, post.endLocationAddress, post.totalDistance, post.routeColor, post.routeName,
    user.userNickname, user.userGender, user.userAge, user.userImage,user.userId,
    (SELECT
      CASE
      WHEN TIMESTAMPDIFF(MINUTE, post.createdAt,NOW())<=0 THEN '방금 전'
      WHEN TIMESTAMPDIFF(MINUTE, post.createdAt, NOW()) < 60 THEN CONCAT(TIMESTAMPDIFF(MINUTE, post.createdAt, NOW()), '분 전')
      WHEN TIMESTAMPDIFF(HOUR, post.createdAt, NOW()) < 24 THEN CONCAT(TIMESTAMPDIFF(HOUR, post.createdAt, NOW()), '시간 전')
      WHEN TIMESTAMPDIFF(DAY, post.createdAt, NOW()) < 7 THEN CONCAT(TIMESTAMPDIFF(Day, post.createdAt, NOW()), '일 전')
      ELSE post.createdAt
      END) AS AGOTIME
    from post
    join dog
    on post.userId = dog.userId
    join user
    on user.userId = dog.userId
    WHERE post.postId ='${postId}'`;
    db.query(query, (error, rows) => {
      console.log("들어가니",rows)
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      // logger.info('게시글을 성공적으로 조회했습니다.');
      res.status(200).json({
        success: true,
        posts: rows[0],
        // existRequest
      });
    });
  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});







//카테고리 전체 조회
router.get('/category', function (req, res, next) {
  let conditions = [];
  let where
  console.log("get method 연결완료!")
  const {dogSize, dogGender, dogAge, locationCategory, completed} = req.body;
  console.log(dogSize, dogGender, dogAge, locationCategory, completed)

  //카테고리 필터
  if(dogSize !== 'undefined'){
    conditions.push(`dogSize = '${dogSize}'`);
  }
  if(dogGender !== 'undefined'){
    conditions.push(`dogGender = '${dogGender}'`);
  }
  if(dogAge !== 'undefined'){
    conditions.push(`dogAge = '${dogAge}'`);
  }
  if(locationCategory !== 'undefined'){
    conditions.push(`locationCategory = '${locationCategory}'`);
  }
  if(completed !== 'undefined'){
    conditions.push(`completed = '${completed}'`);
  }
  where = conditions.join(' AND ' );
  console.log('where', where);

  try {
    console.log(4)
    const query = `SELECT dog.dogId, dog.dogGender, dog.dogName, dog.dogSize, dog.dogBreed, dog.dogAge, dog.neutral, dog.dogComment, dog.dogImage, dog.userId,
    post.userId, post.postId, post.meetingDate, post.completed, post.locationCategory
    FROM post
    JOIN dog
    ON dog.userId=post.userId
    WHERE ` + where
    console.log('query', typeof query);
    db.query(query, (error, rows) => {
      if (error) {
        console.log(error)
        // logger.error('게시글 조회 중 DB관련 에러가 발생했습니다', error);
        return res.sendStatus(400);
      }
      res.status(200).json({
        success: true,
        posts: rows,
      });
      console.log("rows는", rows)
      // logger.info('게시글을 성공적으로 조회했습니다.');
    });

  } catch (err) {
    // logger.error('게시글 조회 중 에러가 발생 했습니다: ', err);
    return res.sendStatus(500);
  }
});


//산책 게시물 수정하기
router.patch('/:postId/:userId', async (req, res) => {
  try{
  const {postId,userId} = req.params;
  console.log("수정하기 들어오니?")
  // const userId = res.locals.user.userId;
  const {locationCategory, meetingDate, wishDesc, dogCount,startLocationAddress,endLocationAddress,completed,totalDistance,totalTime,routeColor,routeName} = req.body;
  console.log(locationCategory, meetingDate, wishDesc, dogCount,startLocationAddress,endLocationAddress,completed,totalDistance,totalTime,routeColor,routeName)
  const escapeQuery = {
    locationCategory: locationCategory,
    meetingDate: meetingDate,
    wishDesc: wishDesc,
    dogCount:dogCount,
    startLocationAddress:startLocationAddress,
    endLocationAddress:endLocationAddress,
    completed:completed,
    totalDistance:totalDistance,
    totalTime:totalTime,
    totalDistance:totalDistance,
    routeColor:routeColor,
    routeName:routeName,
    // coordinate:coordinate
  };
  const query = `UPDATE post SET ? WHERE postId = ${postId} and userId = '${userId}'`;
  await db.query(query, escapeQuery, (error, rows, fields) => {
    console.log(rows)
    if (error) {
      console.log(error)
      // logger.error('게시글 수정 중 DB관련 에러가 발생했습니다', error);
      return res.status(400).json({
        success: false,
        error,
      });
    } else {
      console.log("rows",rows)
      // logger.info('게시글을 성공적으로 수정하였습니다.');
      return res.status(200).json({
        success: true,
        posts: rows,
      });
    }
  });
} catch (err) {
  // logger.error('게시물 수정하기 중 예상하지 못한 에러가 밣생 했습니다', err);
  return res.sendStatus(500);
}
});

//유저가 마감 하기
router.patch('/completion/:postId', auth, async (req, res) => {
  console.log("마감여부 접속 완료 ")
  try {
  const postId = req.params.postId;
  const userEmail = res.locals.user.userEmail;
  console.log("user_email",userEmail)
  const userId = res.locals.user.userId;
  const {completed} = req.body;
  const escapeQuery = {
    completed:completed
  }
  const query = `UPDATE post SET ? WHERE postId = ${postId} and userId = '${userId}'`;
  await db.query(query, escapeQuery, (error,rows,fields) => {
    if (error) {
      // logger.error('마감 여부 설정 중 DB관련 에러가 발생했습니다', error);
      return res.status(400).json({
        success: false,
        error,
      });
    } else {
      // logger.info('마감 여부가 성공적으로 바뀌었습니다');
      return res.status(200).json({
        success: true,
      })
    }
  })
} catch (err) {
  // logger.error('마감 여부 설정 중 예상하지 못한 에러가 밣생 했습니다', err);
  return res.sendStatus(500);
}
})

//산책인원 카운트 하기
// router.post('/completed/:postId', auth, async (req, res) => {
//   const {postId} =req.params;
//   //
//   const userId = res.locals.user.userId;
//   try {
//     const {meetingDate,wishDesc,locationCategory, dogCount,totalTime,startLocationAddress,endLocationAddress,totalDistance,routeColor,routeName} = req.body;
//     console.log(meetingDate)
//     const params= [
//       meetingDate,
//       wishDesc,
//       completed,
//       locationCategory,
//       dogCount,
//       totalTime,
//       startLocationAddress,
//       endLocationAddress,
//       totalDistance,
//       routeColor,
//       routeName,
//       userId,
//     ];
//     const query =
//     'INSERT INTO post (meetingDate,wishDesc,completed,locationCategory,dogCount,totalTime,startLocationAddress,endLocationAddress,totalDistance,routeColor,routeName, userId) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)';
//       await db.query(query, params, (error, rows, fields) => {
//         console.log("row는",rows)
//         if (error) {
//           console.log(error)
//           // logger.error('게시글 저장 중 DB관련 에러가 발생 했습니다', error);
//           return res.status(400).json({
//             success: false,
//             errMessage: '400 에러 게시중 오류가 발생 하였습니다!.'
//           });
//         }
//         // logger.info(`${userNickname}님, 게시글 등록이 완료되었습니다.`);
//         return res.status(201).json({
//           success: true,
//           Message: '게시글이 성공적으로 포스팅 되었습니다!.'
//         });
//       });
//     } catch (err) {
//       // logger.error('게시글 작성 중 에러가 발생 했습니다: ', err);
//       return res.status(500).json({
//         success: false,
//         errMessage: '500 에러 게시중 오류가 발생 하였습니다!.'
//       });
//     }
//   })




module.exports = router;