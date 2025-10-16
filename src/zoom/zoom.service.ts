import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

export interface ZoomMeetingConfig {
  topic: string;
  type: number; // 1 = Instant meeting, 2 = Scheduled meeting
  start_time?: string; // UTC datetime
  duration: number; // Meeting duration in minutes
  timezone?: string;
  password?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    cn_meeting?: boolean;
    in_meeting?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number;
    audio?: string;
    auto_recording?: string;
    enforce_login?: boolean;
    enforce_login_domains?: string;
    alternative_hosts?: string;
    close_registration?: boolean;
    show_share_button?: boolean;
    allow_multiple_devices?: boolean;
    registrants_email_notification?: boolean;
    meeting_authentication?: boolean;
    waiting_room?: boolean;
  };
}

export interface ZoomMeetingResponse {
  uuid: string;
  id: number;
  host_id: string;
  host_email: string;
  topic: string;
  type: number;
  status: string;
  start_time: string;
  duration: number;
  timezone: string;
  agenda: string;
  created_at: string;
  start_url: string;
  join_url: string;
  password: string;
  h323_password: string;
  pstn_password: string;
  encrypted_password: string;
  settings: {
    host_video: boolean;
    participant_video: boolean;
    cn_meeting: boolean;
    in_meeting: boolean;
    join_before_host: boolean;
    mute_upon_entry: boolean;
    watermark: boolean;
    use_pmi: boolean;
    approval_type: number;
    audio: string;
    auto_recording: string;
    enforce_login: boolean;
    enforce_login_domains: string;
    alternative_hosts: string;
    close_registration: boolean;
    show_share_button: boolean;
    allow_multiple_devices: boolean;
    registrants_email_notification: boolean;
    meeting_authentication: boolean;
    waiting_room: boolean;
  };
}

@Injectable()
export class ZoomService {
  private readonly logger = new Logger(ZoomService.name);
  private accessToken: string | null = null;
  private tokenExpirationTime: number | null = null;

  constructor() {}

  /**
   * Get Zoom Server-to-Server OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    try {
      // Check if we have a valid token that's not expired
      if (
        this.accessToken &&
        this.tokenExpirationTime &&
        Date.now() < this.tokenExpirationTime
      ) {
        return this.accessToken;
      }

      const accountId = process.env.ZOOM_ACCOUNT_ID;
      const clientId = process.env.ZOOM_CLIENT_ID;
      const clientSecret = process.env.ZOOM_CLIENT_SECRET;

      this.logger.log(`🔍 Zoom credentials check:`);
      this.logger.log(
        `Account ID: ${accountId ? `${accountId.substring(0, 10)}...` : 'MISSING'}`,
      );
      this.logger.log(
        `Client ID: ${clientId ? `${clientId.substring(0, 10)}...` : 'MISSING'}`,
      );
      this.logger.log(`Client Secret: ${clientSecret ? 'SET' : 'MISSING'}`);

      if (!accountId || !clientId || !clientSecret) {
        throw new Error(
          'Zoom credentials not configured. Please set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET in environment variables.',
        );
      }

      const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
        'base64',
      );

      const response: AxiosResponse<{
        access_token: string;
        expires_in: number;
      }> = await axios.post(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
        {},
        {
          headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      // Set expiration time to 5 minutes before actual expiration for safety
      this.tokenExpirationTime =
        Date.now() + (response.data.expires_in - 300) * 1000;

      this.logger.log('Successfully obtained Zoom access token');
      return this.accessToken;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Failed to get Zoom access token:', {
          message: error.message,
          response: error.response?.data as unknown,
          status: error.response?.status,
          accountId: process.env.ZOOM_ACCOUNT_ID ? 'Set' : 'Not set',
          clientId: process.env.ZOOM_CLIENT_ID ? 'Set' : 'Not set',
          clientSecret: process.env.ZOOM_CLIENT_SECRET ? 'Set' : 'Not set',
        });

        throw new HttpException(
          `Failed to authenticate with Zoom API: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }

      this.logger.error('Failed to get Zoom access token:', error);
      throw new HttpException(
        `Failed to authenticate with Zoom API: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a Zoom meeting
   */
  async createMeeting(
    meetingConfig: ZoomMeetingConfig,
  ): Promise<ZoomMeetingResponse> {
    try {
      this.logger.log(`🎬 Creating Zoom meeting: ${meetingConfig.topic}`);
      const accessToken = await this.getAccessToken();
      this.logger.log(
        `✅ Got access token: ${accessToken.substring(0, 20)}...`,
      );

      // Default meeting settings for educational use
      const defaultSettings = {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 2, // No registration required
        audio: 'both',
        auto_recording: 'none',
        enforce_login: false,
        waiting_room: false,
        allow_multiple_devices: true,
        ...meetingConfig.settings,
      };

      const meetingData = {
        topic: meetingConfig.topic,
        type: meetingConfig.type,
        start_time: meetingConfig.start_time,
        duration: meetingConfig.duration,
        timezone: meetingConfig.timezone || 'UTC',
        password: meetingConfig.password || this.generateMeetingPassword(),
        agenda: meetingConfig.agenda || '',
        settings: defaultSettings,
      };

      this.logger.log(`📡 Sending request to Zoom API...`);
      this.logger.log(`Meeting data: ${JSON.stringify(meetingData, null, 2)}`);

      const response: AxiosResponse<ZoomMeetingResponse> = await axios.post(
        'https://api.zoom.us/v2/users/me/meetings',
        meetingData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Join URL: ${response.data.join_url}`);
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Failed to create Zoom meeting:', {
          message: error.message,
          response: error.response?.data as unknown,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data as unknown,
          },
        });
        throw new HttpException(
          `Failed to create Zoom meeting: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      let message = 'An unknown error occurred';
      if (error instanceof Error) {
        message = error.message;
      }

      this.logger.error('Failed to create Zoom meeting:', error);
      throw new HttpException(
        `Failed to create Zoom meeting: ${message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Update a Zoom meeting
   */
  async updateMeeting(
    meetingId: string,
    meetingConfig: Partial<ZoomMeetingConfig>,
  ): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      await axios.patch(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        meetingConfig,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      this.logger.log(`Successfully updated Zoom meeting: ${meetingId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          'Failed to update Zoom meeting:',
          error.response?.data,
        );
      } else {
        this.logger.error('Failed to update Zoom meeting:', error);
      }
      throw new HttpException(
        'Failed to update Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Delete a Zoom meeting
   */
  async deleteMeeting(meetingId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      await axios.delete(`https://api.zoom.us/v2/meetings/${meetingId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      this.logger.log(`Successfully deleted Zoom meeting: ${meetingId}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          'Failed to delete Zoom meeting:',
          error.response?.data,
        );
      } else {
        this.logger.error('Failed to delete Zoom meeting:', error);
      }
      throw new HttpException(
        'Failed to delete Zoom meeting',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get Zoom meeting details
   */
  async getMeeting(meetingId: string): Promise<ZoomMeetingResponse> {
    try {
      const accessToken = await this.getAccessToken();

      const response: AxiosResponse<ZoomMeetingResponse> = await axios.get(
        `https://api.zoom.us/v2/meetings/${meetingId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error('Failed to get Zoom meeting:', error.response?.data);
      } else {
        this.logger.error('Failed to get Zoom meeting:', error);
      }
      throw new HttpException(
        'Failed to get Zoom meeting details',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate a secure meeting password
   */
  private generateMeetingPassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Create a meeting for a scheduled session
   */
  async createSessionMeeting(
    sessionTitle: string,
    sessionType: string,
    startTime: Date,
    durationMinutes: number,
    teacherName?: string,
  ): Promise<ZoomMeetingResponse> {
    const meetingConfig: ZoomMeetingConfig = {
      topic: `${sessionTitle} - ${sessionType}`,
      type: 2, // Scheduled meeting
      start_time: startTime.toISOString(),
      duration: durationMinutes,
      timezone: 'UTC',
      agenda: `Educational session: ${sessionTitle}${teacherName ? ` with ${teacherName}` : ''}`,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false, // Teacher must start the session
        mute_upon_entry: true,
        waiting_room: true, // Enable waiting room for better control
        allow_multiple_devices: true,
        auto_recording: 'none',
        approval_type: 0, // Automatic approval
      },
    };

    return await this.createMeeting(meetingConfig);
  }

  /**
   * Create an instant meeting for immediate sessions
   */
  async createInstantMeeting(
    sessionTitle: string,
    sessionType: string,
    durationMinutes: number = 60,
    teacherName?: string,
  ): Promise<ZoomMeetingResponse> {
    const meetingConfig: ZoomMeetingConfig = {
      topic: `${sessionTitle} - ${sessionType}`,
      type: 1, // Instant meeting
      duration: durationMinutes,
      agenda: `Educational session: ${sessionTitle}${teacherName ? ` with ${teacherName}` : ''}`,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: true,
        waiting_room: false, // No waiting room for instant meetings
        allow_multiple_devices: true,
        auto_recording: 'none',
      },
    };

    return await this.createMeeting(meetingConfig);
  }
}
