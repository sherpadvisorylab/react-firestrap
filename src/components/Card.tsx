import React from 'react';
import {useTheme} from "../Theme";
import {Wrapper} from "./GridSystem";
import Loader from "./Loader";

const Card = ({
                children,
                title = null,
                header = null,
                footer = null,
                cardClass = null,
                headerClass = null,
                bodyClass= null,
                footerClass = null,
                wrapClass = null,
                showLoader = null,
                showArrow = null
}: {
    children: any,
    title?: string,
    header?: any,
    footer?: any,
    cardClass?: string,
    headerClass?: string,
    bodyClass?: string,
    footerClass?: string,
    wrapClass?: string,
    showLoader?: boolean,
    showArrow?: boolean
}) => {
  const theme = useTheme();

  return (
    <Wrapper className={wrapClass || theme.Card.wrapClass}>
        <div className={"card " + (cardClass || theme.Card.cardClass)}>
          {(header || title) &&
            <div className={"card-header " + (headerClass || theme.Card.headerClass)}>
                {title ? <h5 className="mt-2 text-nowrap">{title}</h5> : ""}
                {header}
            </div>
          }

          <div className={"card-body " + (bodyClass || theme.Card.bodyClass)}>
              <Loader show={showLoader || theme.Card.showLoader}>
                {children}
              </Loader>
          </div>
          {footer && <div className={"card-footer " + (footerClass || theme.Card.footerClass)}>{footer}</div>}
          {(showArrow || theme.Card.showArrow) &&
            <div className="card-arrow">
              <div className="card-arrow-top-left" />
              <div className="card-arrow-top-right" />
              <div className="card-arrow-bottom-left" />
              <div className="card-arrow-bottom-right" />
            </div>
          }
        </div>
    </Wrapper>
  );
};

export default Card;
