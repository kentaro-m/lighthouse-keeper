import { Handler } from 'aws-lambda'
import { S3 } from 'aws-sdk'

export const handler: Handler = async (event, __, callback) => {
  try {
    console.log(JSON.stringify(event))

    const bucketName = process.env.S3_BUCKET_NAME

    if (!bucketName) {
      throw new Error('cloud storage bucket name is not set.')
    }

    const report = {
      user_agent: event.data.userAgent,
      fetch_time: event.data.fetchTime,
      requested_url: event.data.requestedUrl,
      final_url: event.data.finalUrl,
      performance: {
        first_contentful_paint: {
          score: event.data.audits['first-contentful-paint'].score,
          raw_value: event.data.audits['first-contentful-paint'].numericValue,
        },
        largest_contentful_paint: {
          score: event.data.audits['largest-contentful-paint'].score,
          raw_value: event.data.audits['largest-contentful-paint'].numericValue,
        },
        cumulative_layout_shift: {
          score: event.data.audits['cumulative-layout-shift'].score,
          raw_value: event.data.audits['cumulative-layout-shift'].numericValue,
        },
        server_response_time: {
          score: event.data.audits['server-response-time'].score,
          raw_value: event.data.audits['server-response-time'].numericValue,
        },
        max_potential_fid: {
          score: event.data.audits['max-potential-fid'].score,
          raw_value: event.data.audits['max-potential-fid'].numericValue,
        },
        interactive: {
          score: event.data.audits['interactive'].score,
          raw_value: event.data.audits['interactive'].numericValue,
        },
        total_blocking_time: {
          score: event.data.audits['total-blocking-time'].score,
          raw_value: event.data.audits['total-blocking-time'].numericValue,
        },
        speed_index: {
          score: event.data.audits['speed-index'].score,
          raw_value: event.data.audits['speed-index'].numericValue,
        },
      }
    }
    
    const s3 = new S3({apiVersion: '2006-03-01'})

    await s3.upload({
      Bucket: bucketName,
      Key: `report_${event.data.fetchTime}.json`,
      Body: JSON.stringify(report, (_, value) => value ? value : null),
      ContentType: 'application/json'
    }).promise()
    
    return callback(null)
  } catch (error) {
    console.log(error)
    return callback(error)
  }
}