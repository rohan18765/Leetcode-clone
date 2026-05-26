
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const submissionSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problemId: {
    type: Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true,
    enum: ['c++', 'java', 'python']
  },
status: {
    type: String,
    enum: [
      'pending', 
      'accepted', 
      'wrong_answer', // Usually better than just 'wrong'
      'error', // For compilation errors
      'time_limit_exceeded', // TLE
      'memory_limit_exceeded' // MLE
    ],
    default: 'pending'
  },
  runtime: {
    type: Number,  // milliseconds
    default: 0
  },
  memory: {
    type: Number,  // kB
    default: 0
  },
  errorMessage: {
    type: String,
    default: ''
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  testCasesTotal: {  // Recommended addition
    type: Number,
    default: 0
  }
}, { 
  timestamps: true
});

submissionSchema.index({userId:1 , problemId:1});


const Submission = mongoose.model("submissions" , submissionSchema ) ;

module.exports = {Submission} ;