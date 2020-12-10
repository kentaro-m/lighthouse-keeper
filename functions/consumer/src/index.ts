import { SQSHandler } from 'aws-lambda'
import { StepFunctions } from 'aws-sdk'

export const handler: SQSHandler = async (event) => {
  try {
    const stateMachine = process.env.STATE_MACHINE

    if (!stateMachine) {
      throw new Error('state machine is not set.')
    }

    const stepFunctions = new StepFunctions()
    
    await stepFunctions.startExecution({
      input: JSON.stringify(event),
      stateMachineArn: stateMachine
    }).promise()
  } catch (error) {
    console.log(error)
  }
}