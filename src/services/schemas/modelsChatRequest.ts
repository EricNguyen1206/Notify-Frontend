/**
 * Generated by orval v7.10.0 🍺
 * Do not edit manually.
 */
import type { ModelsChatRequestType } from './modelsChatRequestType';

export interface ModelsChatRequest {
  /** for channel */
  channelId?: number;
  fileName?: string;
  /** for direct */
  receiverId?: number;
  text?: string;
  type: ModelsChatRequestType;
  url?: string;
}
