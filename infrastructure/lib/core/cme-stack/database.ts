import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class AppDatabase extends Construct {
  public readonly questionsTable: dynamodb.ITable;
  public readonly myCoursesTable: dynamodb.ITable;
  public readonly packageTable: dynamodb.ITable;
  public readonly submittedPapersTable: dynamodb.ITable;
  public readonly examResultsTable: dynamodb.ITable;
  public readonly topRatedPapers: dynamodb.ITable;
  public readonly examResultsHistoryTable: dynamodb.ITable;
  public readonly userProfileTable: dynamodb.ITable;
  public readonly userCreditsTable: dynamodb.ITable;
  public readonly paymentHistoryTable: dynamodb.ITable;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    const environmentType = process.env.NODE_ENV?.trim();  // Fetch your environment type here
    
        // Define table name prefix based on the environmentType
        let tableNamePrefix = '';
        if (environmentType === 'production') {
          tableNamePrefix = 'prod';
        } else if (environmentType === 'development') {
          tableNamePrefix = 'dev';
        } else if (environmentType === 'uat') {
          tableNamePrefix = 'uat';
        } else {
          tableNamePrefix = 'unknown';
        }

//----------------Create Questions Table ---------------------------//    
    const questionsTable = new dynamodb.Table(this, "QuestionsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: `${tableNamePrefix}_ExamQuestionsTable`,
      partitionKey: {
        name: "paperid",  //Paper ID
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "qid", //Question ID
        type: dynamodb.AttributeType.STRING,
      },
    });

    //   questionsTable.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "paperid",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   projectionType: dynamodb.ProjectionType.INCLUDE,
    //   nonKeyAttributes: ["qid"],
    // });

    questionsTable.addGlobalSecondaryIndex({
      indexName: `${tableNamePrefix}_GSI1`,
      partitionKey: {
        name: "paperid",
        type: dynamodb.AttributeType.STRING,
      },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["qid"],
    });

    // questionsTable.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "paperid",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: "qid", //question id
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   projectionType: dynamodb.ProjectionType.INCLUDE,
    //   nonKeyAttributes: ["qt", "a", "o1", "o2", "o3", "o4", "qe"],
    // });

    this.questionsTable = questionsTable;

  //----------------Create MyCourses Table ---------------------------//  

    const myCoursesTable = new dynamodb.Table(this, "MyCoursesTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: `${tableNamePrefix}_MyExamCoursesTable`,
      partitionKey: {
        name: "userid",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "paperid",
        type: dynamodb.AttributeType.STRING,
      },
    });

    this.myCoursesTable = myCoursesTable;

    //----------------Create packageTable Table ---------------------------//
    const packageTable = new dynamodb.Table(
      this,
      "PackageTable",
      {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        tableName: `${tableNamePrefix}_PackageTable`,
        partitionKey: {
          name: "userid",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "packageid", 
          type: dynamodb.AttributeType.STRING,
        },
      }
    );

    packageTable.addGlobalSecondaryIndex({
      indexName: `${tableNamePrefix}_GSI1`,
      partitionKey: {
        name: "packageid",
        type: dynamodb.AttributeType.STRING,
      },
      // sortKey: {
      //   name: "paperrating",
      //   type: dynamodb.AttributeType.NUMBER,
      // },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.packageTable = packageTable;


//----------------Create SubmittedPapers Table ---------------------------//
    const submittedPapersTable = new dynamodb.Table(
      this,
      "SubmittedPapersTable",
      {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        tableName: `${tableNamePrefix}_SubmittedExamPapersTable`,
        partitionKey: {
          name: "userid",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "paperid", 
          type: dynamodb.AttributeType.STRING,
        },
      }
    );

    // submittedPapersTable.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "dummycolumn",
    //     type: dynamodb.AttributeType.NUMBER,
    //   },
    //   sortKey: {
    //     name: "paperrating",
    //     type: dynamodb.AttributeType.NUMBER,
    //   },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    // submittedPapersTable.addGlobalSecondaryIndex({
    //   indexName: "GSI2",
    //   partitionKey: {
    //     name: "paperid",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: "dummycolumn",
    //     type: dynamodb.AttributeType.NUMBER,
    //   },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    submittedPapersTable.addGlobalSecondaryIndex({
      indexName: `${tableNamePrefix}_GSI1`,
      partitionKey: {
        name: "dummycolumn",
        type: dynamodb.AttributeType.NUMBER,
      },
      sortKey: {
        name: "paperrating",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    submittedPapersTable.addGlobalSecondaryIndex({
      indexName: `${tableNamePrefix}_GSI2`,
      partitionKey: {
        name: "paperid",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "dummycolumn",
        type: dynamodb.AttributeType.NUMBER,
      },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    this.submittedPapersTable = submittedPapersTable;


//----------------Create ExamResults Table ---------------------------//
    const examResultsTable = new dynamodb.Table(this, "MyExamResultsTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: `${tableNamePrefix}_MyExamResultsTable`,
      partitionKey: {
        name: "userid",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "pqid",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // examResultsTable.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "paperid",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: "qid",
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   projectionType: dynamodb.ProjectionType.ALL,
    // });

    this.examResultsTable = examResultsTable;

//----------------Create ExamResults Table ---------------------------//
const examResultsHistoryTable = new dynamodb.Table(this, "ExamResultsHistoryTable", {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  tableName: `${tableNamePrefix}_ExamResultsHistoryTable`,
  partitionKey: {
    name: "userid",
    type: dynamodb.AttributeType.STRING,
  },
  sortKey: {
    name: "paperid",
    type: dynamodb.AttributeType.STRING,
  },
});

this.examResultsHistoryTable = examResultsHistoryTable;


//----------------Create TopRatedPapers Table ---------------------------//
    const topRatedPapers = new dynamodb.Table(this, "TopRatedPapers", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      tableName: `${tableNamePrefix}_TenTopRatedPapers`,
      partitionKey: {
        name: "paperid",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "paperrating",
        type: dynamodb.AttributeType.NUMBER,
      },
    });

    this.topRatedPapers = topRatedPapers;

    //----------------User Profile Table ---------------------------//    
// const userProfileTable = new dynamodb.Table(this, "UserProfileTable", {
//   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
//   tableName: `${tableNamePrefix}_"UserProfileTable`,
//   partitionKey: {
//     name: "userid",  //User ID
//     type: dynamodb.AttributeType.STRING,
//   },
//   sortKey: {
//     name: "country", //User country
//     type: dynamodb.AttributeType.STRING,
//   },
// });

// this.userProfileTable = userProfileTable;



const userProfileTable = new dynamodb.Table(this, "UserProfileTab", {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  tableName: `${tableNamePrefix}_UserProfileTab`,
  partitionKey: {
    name: "userid", // User ID
    type: dynamodb.AttributeType.STRING,
  },
});
this.userProfileTable = userProfileTable;


const userCreditsTable = new dynamodb.Table(this, "UserCredits", {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  tableName: `${tableNamePrefix}_UserCredits`,
  partitionKey: {
    name: "userid", // User ID
    type: dynamodb.AttributeType.STRING,
  },
});
this.userCreditsTable = userCreditsTable;

const paymentHistoryTable = new dynamodb.Table(this, "PaymentHistory", {
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  tableName: `${tableNamePrefix}_PaymentHistory`,
  partitionKey: {
    name: "paymentid", // User ID
    type: dynamodb.AttributeType.STRING,
  },
});
this.paymentHistoryTable = paymentHistoryTable;

}}


//------------------Just for Reference---------------
    // const questionsTable = new dynamodb.Table(this, "QuestionsTable", {
    //   billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    //   partitionKey: {
    //     name: "userid",  //User ID
    //     type: dynamodb.AttributeType.STRING,
    //   },
    //   sortKey: {
    //     name: "paperid", //Paper ID
    //     type: dynamodb.AttributeType.NUMBER,
    //   },
    // });

    // questionsTable.addGlobalSecondaryIndex({
    //   indexName: "GSI1",
    //   partitionKey: {
    //     name: "paperid",
    //     type: dynamodb.AttributeType.NUMBER,
    //   },
    //   sortKey: {
    //     name: "qid", //question id
    //     type: dynamodb.AttributeType.NUMBER,
    //   },
    //   projectionType: dynamodb.ProjectionType.INCLUDE,
    //   nonKeyAttributes: ["qt", "a", "o1", "o2", "o3", "o4", "qe"],
    // });

    // this.questionsTable = questionsTable;
